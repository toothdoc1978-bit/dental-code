import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { generateNote } from './noteGenerator.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '50kb' }))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, hasApiKey: !!process.env.ANTHROPIC_API_KEY })
})

app.post('/api/generate-note', async (req, res) => {
  try {
    const { chartData } = req.body || {}
    if (!chartData) return res.status(400).json({ error: 'Missing chartData' })

    const phiFields = ['patientName', 'name', 'dob', 'medicaidId', 'ssn', 'address', 'phone']
    for (const k of phiFields) {
      if (k in chartData) return res.status(400).json({ error: `PHI field "${k}" not permitted` })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set on server. Add it to .env and restart.' })
    }

    const note = await generateNote(chartData)
    res.json({ note })
  } catch (err) {
    console.error('Note generation failed:', err.message)
    res.status(500).json({ error: 'Note generation failed' })
  }
})

app.listen(PORT, () => {
  console.log(`Dental charting API listening on http://localhost:${PORT}`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set. Note generation will fail until you add it to .env.')
  }
})
