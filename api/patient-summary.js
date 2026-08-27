import { generatePatientSummary } from '../server/noteGenerator.js'
import { findPhiKey } from '../server/phiGuard.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { chartData } = req.body || {}
    if (!chartData) return res.status(400).json({ error: 'Missing chartData' })

    const phiKey = findPhiKey(chartData)
    if (phiKey) return res.status(400).json({ error: `PHI field "${phiKey}" not permitted` })

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on the server' })
    }

    const summary = await generatePatientSummary(chartData)
    return res.status(200).json({ summary })
  } catch (err) {
    console.error('Patient summary generation failed:', err.message)
    return res.status(500).json({ error: 'Patient summary generation failed' })
  }
}
