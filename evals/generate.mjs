// Synthetic encounter generator. Asks Claude for diverse, schema-valid, PHI-free
// charts to broaden eval coverage beyond the hand-written seed cases.
//
// Usage:
//   ANTHROPIC_API_KEY=... node evals/generate.mjs [count]
// Writes evals/generated/cases-<timestamp>.json (picked up automatically by run.mjs).

import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { cleanChart, CHART_SCHEMA_DESCRIPTION } from './schema.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const client = new Anthropic()

const SYSTEM = `You generate synthetic dental-encounter chart data for testing a clinical-note generator. Produce realistic, clinically coherent, DIVERSE encounters. Cover a wide spread: adult/child/EPSDT patients; comprehensive/periodic/limited/emergency/scheduled visits; exam-only and operative visits; restorative, endodontic, crown, extraction, SRP, preventive, and prosthetic procedures; with and without radiographs (including ALARA catch-all pano cases); signed-consent and no-consent cases; medical-history changes; pediatric under-12 visual perio cases; and a few sparse/extenuating encounters. Vary ages and findings.

${CHART_SCHEMA_DESCRIPTION}

Return ONLY a JSON array. Each element: { "name": "<short label>", "chart": { ...chart object... } }. No prose, no markdown fences.`

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fenced ? fenced[1] : text
  const start = body.indexOf('[')
  const end = body.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('no JSON array found in model output')
  return JSON.parse(body.slice(start, end + 1))
}

export async function generateSyntheticCharts({ count = 12, model = 'claude-sonnet-4-6' } = {}) {
  const response = await client.messages.create({
    model,
    max_tokens: 8192,
    temperature: 1,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Generate ${count} diverse encounters as a JSON array now.` }]
  })
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n')
  const arr = extractJson(text)
  return arr
    .filter((e) => e && (e.chart || e.visitSetup))
    .map((e, i) => ({ name: `synthetic: ${e.name || `case ${i + 1}`}`, chart: cleanChart(e.chart || e) }))
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  const count = Number(process.argv[2]) || 12
  console.log(`Generating ${count} synthetic encounters...`)
  const cases = await generateSyntheticCharts({ count })
  const file = join(__dirname, 'generated', `cases-${Date.now()}.json`)
  writeFileSync(file, JSON.stringify(cases, null, 2))
  console.log(`Wrote ${cases.length} cases to ${file}`)
}
