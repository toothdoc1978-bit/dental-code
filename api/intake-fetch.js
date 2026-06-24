import crypto from 'node:crypto'

const PHI_KEYS = ['patientName', 'name', 'dob', 'medicaidId', 'ssn', 'address', 'phone']
const CODE_RE = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/
const TIMEOUT_MS = 10_000

function sanitize(value) {
  if (value === null || typeof value !== 'object') return
  if (Array.isArray(value)) { value.forEach(sanitize); return }
  for (const k of Object.keys(value)) {
    if (PHI_KEYS.includes(k)) throw new Error(`disallowed:${k}`)
    sanitize(value[k])
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  res.setHeader('Cache-Control', 'no-store')

  const code = String(req.query?.code || '')
  if (!CODE_RE.test(code)) return res.status(400).json({ error: 'invalid code format' })

  const base = process.env.INTAKE_MIDDLEWARE_URL
  const secret = process.env.INTAKE_SHARED_SECRET
  if (!base || !secret) return res.status(500).json({ error: 'intake bridge not configured' })

  const pathAndQuery = `/api/intake-fetch?code=${code}`
  const sig = crypto.createHmac('sha256', secret).update(pathAndQuery).digest('hex')
  const mask = `${code.slice(0, 4)}-****`

  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS)
  try {
    const up = await fetch(`${base}${pathAndQuery}`, {
      method: 'GET',
      headers: { 'x-intake-signature': sig },
      signal: ac.signal
    })
    if (up.status === 404) {
      console.error(`intake-fetch ${mask} 404`)
      return res.status(404).json({ error: 'visit code not found or expired' })
    }
    if (!up.ok) {
      console.error(`intake-fetch ${mask} upstream ${up.status}`)
      return res.status(502).json({ error: 'intake bridge upstream error' })
    }
    const json = await up.json()
    try {
      sanitize(json.chartFragment)
    } catch (e) {
      console.error(`intake-fetch ${mask} ${e.message}`)
      return res.status(502).json({ error: 'intake bridge upstream returned disallowed field' })
    }
    console.error(`intake-fetch ${mask} 200`)
    return res.status(200).json({ chartFragment: json.chartFragment })
  } catch (err) {
    console.error(`intake-fetch ${mask} ${err.name || 'error'}`)
    return res.status(502).json({ error: 'intake bridge upstream error' })
  } finally {
    clearTimeout(t)
  }
}
