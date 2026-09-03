// Bootstrap build for Vercel (Build Output API v3).
// Clones toothdoc1978-bit/dental-code@main, builds the Vite site, and bundles
// the three /api functions, so the deployment always reflects merged main
// without the Vercel project needing a git link.
import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const REPO = 'https://github.com/toothdoc1978-bit/dental-code.git'
const BRANCH = process.env.SOURCE_BRANCH || 'main'
const APP = join(process.cwd(), 'app')
const OUT = join(process.cwd(), '.vercel', 'output')
const run = (cmd, cwd = process.cwd(), env = {}) =>
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...env } })

rmSync(APP, { recursive: true, force: true })
rmSync(OUT, { recursive: true, force: true })

run(`git clone --depth 1 --branch ${BRANCH} ${REPO} app`)
const sha = execSync('git rev-parse HEAD', { cwd: APP }).toString().trim()
console.log(`source: ${BRANCH} @ ${sha}`)

run('npm ci --no-audit --no-fund', APP)
run('npm run build', APP, { VERCEL_GIT_COMMIT_SHA: sha })

// Static site
mkdirSync(join(OUT, 'static'), { recursive: true })
cpSync(join(APP, 'dist'), join(OUT, 'static'), { recursive: true })

// Serverless functions: one bundle per api/*.js, ESM with a require shim for CJS deps.
const FUNCTIONS = ['generate-note', 'patient-summary', 'intake-fetch']
for (const fn of FUNCTIONS) {
  const dir = join(OUT, 'functions', 'api', `${fn}.func`)
  mkdirSync(dir, { recursive: true })
  run(
    `npx esbuild api/${fn}.js --bundle --platform=node --format=esm --target=node22 ` +
      `--banner:js="import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" ` +
      `--outfile=${JSON.stringify(join(dir, 'index.mjs'))}`,
    APP
  )
  writeFileSync(
    join(dir, '.vc-config.json'),
    JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', shouldAddHelpers: true }, null, 2)
  )
}

writeFileSync(
  join(OUT, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '^/api/.*$', status: 404 },
        { src: '^/(.*)$', dest: '/index.html' }
      ]
    },
    null,
    2
  )
)
console.log('build output ready:', existsSync(join(OUT, 'config.json')))
