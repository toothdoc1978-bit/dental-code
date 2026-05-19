import { generateNote } from '../server/noteGenerator.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { chartData } = req.body || {}
    if (!chartData) return res.status(400).json({ error: 'Missing chartData' })

    const phiFields = ['patientName', 'name', 'dob', 'medicaidId', 'ssn', 'address', 'phone']
    for (const k of phiFields) {
      if (k in chartData) return res.status(400).json({ error: `PHI field "${k}" not permitted` })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on the server' })
    }

    const note = await generateNote(chartData)
    return res.status(200).json({ note })
  } catch (err) {
    console.error('Note generation failed:', err.message)
    return res.status(500).json({ error: 'Note generation failed' })
  }
}
