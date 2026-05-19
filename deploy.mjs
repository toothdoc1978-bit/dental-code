// Deploys this repo to Vercel via the REST API (bypasses the broken CLI auth path).
// Usage: VERCEL_TOKEN=... VERCEL_TEAM=team_... ANTHROPIC_API_KEY=... node deploy.mjs
import { readFileSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'

const TOKEN = process.env.VERCEL_TOKEN
const TEAM = process.env.VERCEL_TEAM
const ANTHROPIC = process.env.ANTHROPIC_API_KEY
if (!TOKEN || !TEAM) {
  console.error('VERCEL_TOKEN and VERCEL_TEAM env vars are required')
  process.exit(1)
}

const tracked = execSync('git ls-files', { encoding: 'utf-8' })
  .split('\n')
  .filter(Boolean)

const TEXT_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md', '.example', '.mjs', '.cjs', '.svg', '.txt'])
function isText(path) {
  const ext = path.slice(path.lastIndexOf('.'))
  return TEXT_EXT.has(ext) || path === '.gitignore'
}

const files = tracked
  .filter((p) => p !== 'package-lock.json' && p !== 'deploy.mjs' && p !== 'README.md')
  .map((file) => {
    const size = statSync(file).size
    if (isText(file)) {
      return { file, data: readFileSync(file, 'utf-8'), encoding: 'utf-8' }
    }
    return { file, data: readFileSync(file).toString('base64'), encoding: 'base64' }
  })

console.log(`Uploading ${files.length} files...`)

const body = {
  name: 'dental-code',
  project: 'prj_yslFdCcF3jVTuP3cLehPIcZVGpSz',
  files,
  projectSettings: {
    framework: 'vite',
    buildCommand: null,
    devCommand: null,
    installCommand: null,
    outputDirectory: null,
    rootDirectory: null,
    nodeVersion: '22.x'
  },
  target: 'production'
}

const url = `https://api.vercel.com/v13/deployments?teamId=${encodeURIComponent(TEAM)}&forceNew=1&skipAutoDetectionConfirmation=1`
const res = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
})
const data = await res.json()
if (!res.ok) {
  console.error('Deploy creation failed:', res.status)
  console.error(JSON.stringify(data, null, 2))
  process.exit(1)
}

const deploymentId = data.id
const previewUrl = `https://${data.url}`
console.log(`Deployment created: ${previewUrl}`)
console.log(`ID: ${deploymentId}`)

if (ANTHROPIC) {
  console.log('Setting ANTHROPIC_API_KEY env var on the project...')
  const projectId = data.projectId
  const envRes = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env?teamId=${encodeURIComponent(TEAM)}&upsert=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: 'ANTHROPIC_API_KEY',
      value: ANTHROPIC,
      type: 'encrypted',
      target: ['production', 'preview', 'development']
    })
  })
  if (!envRes.ok) console.error('Env var set failed:', envRes.status, await envRes.text())
  else console.log('Env var set.')
}

let attempts = 0
while (attempts++ < 60) {
  await new Promise((r) => setTimeout(r, 5000))
  const statusRes = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}?teamId=${encodeURIComponent(TEAM)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  })
  const status = await statusRes.json()
  console.log(`  [${attempts}] state=${status.readyState || status.state}`)
  if (status.readyState === 'READY') {
    console.log(`\nReady: ${previewUrl}`)
    break
  }
  if (status.readyState === 'ERROR' || status.readyState === 'CANCELED') {
    console.error(`\nDeployment ${status.readyState}`)
    if (status.errorMessage) console.error('Error:', status.errorMessage)
    process.exit(1)
  }
}
