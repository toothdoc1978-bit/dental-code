// Bootstrap build for Vercel (Build Output API v3).
// Clones toothdoc1978-bit/dental-code@main, builds the Vite site, and bundles
// every api/*.js handler, so the deployment always reflects merged main
// without the Vercel project needing a git link. See README.md alongside.
import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = 'https://github.com/toothdoc1978-bit/dental-code.git'
// Branch or tag name only (git clone --branch does not accept a commit SHA).
const BRANCH = process.env.SOURCE_BRANCH || 'main'
// Anchor every path on this file's directory, never on process.cwd(), so
// running the script from anywhere else cannot delete or clone into the
// wrong place. On Vercel the two coincide.
const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, 'app')
const OUT = join(HERE, '.vercel', 'output')
const run = (cmd, cwd = HERE, env = {}) =>
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...env } })

rmSync(APP, { recursive: true, force: true })
rmSync(OUT, { recursive: true, force: true })

run(`git clone --depth 1 --branch ${JSON.stringify(BRANCH)} ${REPO} app`)
const sha = execSync('git rev-parse HEAD', { cwd: APP }).toString().trim()
console.log(`source: ${BRANCH} @ ${sha}`)

run('npm ci --no-audit --no-fund', APP)
run('npm run build', APP, { VERCEL_GIT_COMMIT_SHA: sha })

// Static site
mkdirSync(join(OUT, 'static'), { recursive: true })
cpSync(join(APP, 'dist'), join(OUT, 'static'), { recursive: true })

// Serverless functions: one bundle per file in api/, discovered from the clone
// so a handler added on main can never ship as a silent 404. ESM output with a
// createRequire shim because the bundles carry CommonJS dependencies.
const FUNCTIONS = readdirSync(join(APP, 'api'))
  .filter((f) => f.endsWith('.js'))
  .map((f) => f.slice(0, -3))
  .sort()
if (!FUNCTIONS.length) throw new Error('no api/*.js handlers found in the clone')
console.log(`functions: ${FUNCTIONS.join(', ')}`)
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
