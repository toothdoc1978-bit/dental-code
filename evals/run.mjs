// Eval runner. Generates a note for every case, scores it against the rubric,
// and prints a pass-rate dashboard + writes evals/report.{md,json}.
//
// Usage:
//   ANTHROPIC_API_KEY=... node evals/run.mjs            # notes via local generateNote()
//   EVAL_URL=https://dental-code.vercel.app/api/generate-note node evals/run.mjs   # via deployed API
//   node evals/run.mjs --seed-only                      # skip generated cases
//   node evals/run.mjs --limit 10
//
// Exit code is non-zero if any check fails, so it can gate CI.

import 'dotenv/config'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { SEED_CASES } from './cases.mjs'
import { RUBRIC, scoreNote } from './rubric.mjs'
import { cleanChart } from './schema.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const seedOnly = args.includes('--seed-only')
const limitIdx = args.indexOf('--limit')
const limit = limitIdx !== -1 ? Number(args[limitIdx + 1]) : Infinity
const EVAL_URL = process.env.EVAL_URL
const CONCURRENCY = 4

function loadGeneratedCases() {
  if (seedOnly) return []
  const dir = join(__dirname, 'generated')
  let files
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  } catch {
    return []
  }
  const out = []
  for (const f of files) {
    try {
      const arr = JSON.parse(readFileSync(join(dir, f), 'utf-8'))
      for (const c of arr) out.push({ name: c.name || f, chart: cleanChart(c.chart || c) })
    } catch (e) {
      console.warn(`  skip ${f}: ${e.message}`)
    }
  }
  return out
}

let getNote
if (EVAL_URL) {
  getNote = async (chart) => {
    let lastErr
    for (let i = 0; i < 4; i++) {
      try {
        const res = await fetch(EVAL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chartData: chart })
        })
        const json = await res.json()
        if (json.note) return json.note
        lastErr = new Error(`API error: ${JSON.stringify(json).slice(0, 200)}`)
      } catch (e) {
        lastErr = e
      }
      await new Promise((r) => setTimeout(r, 500 * 2 ** i))
    }
    throw lastErr
  }
} else {
  const mod = await import('../server/noteGenerator.js')
  getNote = (chart) => mod.generateNote(chart)
}

async function pool(items, worker, size) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        results[i] = await worker(items[i], i)
      }
    })
  )
  return results
}

const STATUS_ICON = { pass: '✓', fail: '✗', warn: '!', na: '·' }

async function main() {
  const cases = [...SEED_CASES, ...loadGeneratedCases()].slice(0, limit)
  console.log(`Running ${cases.length} case(s) via ${EVAL_URL ? `API ${EVAL_URL}` : 'local generateNote()'} ...\n`)

  const rows = await pool(
    cases,
    async (c) => {
      try {
        const note = await getNote(c.chart)
        const score = scoreNote(note, c.chart)
        return { name: c.name, note, score, error: null }
      } catch (e) {
        return { name: c.name, note: '', score: null, error: e.message }
      }
    },
    CONCURRENCY
  )

  // Per-check aggregate
  const agg = {}
  for (const check of RUBRIC) agg[check.name] = { pass: 0, fail: 0, warn: 0, na: 0 }

  let totalPass = 0
  let totalCounted = 0
  const failingCases = []

  for (const row of rows) {
    if (row.error) {
      console.log(`ERROR  ${row.name}\n       ${row.error}\n`)
      failingCases.push(row)
      continue
    }
    const { score } = row
    totalPass += score.passing
    totalCounted += score.counted
    for (const r of score.results) agg[r.name][r.status]++
    const failed = score.results.filter((r) => r.status === 'fail')
    const icon = failed.length ? '✗' : '✓'
    console.log(`${icon} [${String(score.pct).padStart(3)}%] ${row.name}`)
    for (const f of failed) console.log(`      ✗ ${f.name}: ${f.detail}`)
    if (failed.length) failingCases.push(row)
  }

  const overall = totalCounted ? Math.round((totalPass / totalCounted) * 100) : 100

  console.log('\n── Per-check pass rate ──')
  for (const check of RUBRIC) {
    const a = agg[check.name]
    const counted = a.pass + a.fail
    const pct = counted ? Math.round((a.pass / counted) * 100) : null
    const bar = pct === null ? '  n/a' : `${String(pct).padStart(3)}%`
    console.log(`  ${bar}  ${check.name}  (${a.pass}✓ ${a.fail}✗ ${a.warn}! ${a.na}·)`)
  }
  console.log(`\nOVERALL: ${overall}% (${totalPass}/${totalCounted} checks)  |  ${failingCases.length} case(s) with failures/errors`)

  writeReport(rows, agg, overall, totalPass, totalCounted, failingCases.length)

  process.exitCode = failingCases.length ? 1 : 0
}

function writeReport(rows, agg, overall, totalPass, totalCounted, failingCount) {
  const json = {
    generatedAt: new Date().toISOString(),
    source: EVAL_URL || 'local generateNote()',
    overallPct: overall,
    totalPass,
    totalCounted,
    failingCases: failingCount,
    perCheck: agg,
    cases: rows.map((r) => ({
      name: r.name,
      error: r.error,
      pct: r.score?.pct ?? null,
      results: r.score?.results ?? [],
      note: r.note
    }))
  }
  writeFileSync(join(__dirname, 'report.json'), JSON.stringify(json, null, 2))

  const lines = [
    `# Eval Report`,
    ``,
    `- Generated: ${json.generatedAt}`,
    `- Source: ${json.source}`,
    `- **Overall: ${overall}%** (${totalPass}/${totalCounted} checks) — ${failingCount} case(s) with failures`,
    ``,
    `## Per-check pass rate`,
    ``,
    `| Check | Pass% | ✓ | ✗ | ! | · |`,
    `|---|---|---|---|---|---|`,
    ...RUBRIC.map((c) => {
      const a = agg[c.name]
      const counted = a.pass + a.fail
      const pct = counted ? `${Math.round((a.pass / counted) * 100)}%` : 'n/a'
      return `| ${c.name} | ${pct} | ${a.pass} | ${a.fail} | ${a.warn} | ${a.na} |`
    }),
    ``,
    `## Cases`,
    ``,
    ...rows.flatMap((r) => {
      if (r.error) return [`### ✗ ${r.name}`, ``, `ERROR: ${r.error}`, ``]
      const failed = r.score.results.filter((x) => x.status === 'fail')
      const head = `### ${failed.length ? '✗' : '✓'} ${r.name} — ${r.score.pct}%`
      const fails = failed.length ? failed.map((f) => `- ✗ **${f.name}**: ${f.detail}`) : ['- all applicable checks passed']
      return [head, ``, ...fails, ``]
    })
  ]
  writeFileSync(join(__dirname, 'report.md'), lines.join('\n'))
  console.log(`\nWrote evals/report.md and evals/report.json`)
}

main()
