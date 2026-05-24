import { Section, PageTitle } from './shared.jsx'
import {
  CDT_ICD10_CROSSWALK,
  derivedRequiredConsents,
  lookupCrosswalk,
  validateTreatmentCoding,
  diagnosisIcdMismatch
} from '../data/examDefaults.js'

// Each check returns {status: 'pass'|'fail'|'warn', label, detail?}.
// Status 'fail' deducts from the score; 'warn' renders but doesn't.
function runChecks(state) {
  const checks = []

  // Visit setup completeness
  checks.push({
    label: 'Patient type, visit type, and date of service selected',
    status: state.visitSetup.patientType && state.visitSetup.visitType && state.visitSetup.visitDate ? 'pass' : 'fail'
  })

  // Provider for scheduled treatment
  if (state.visitSetup.visitType === 'scheduled') {
    checks.push({
      label: 'Treating provider selected (scheduled-treatment visits)',
      status: state.visitSetup.provider ? 'pass' : 'fail'
    })
  }

  // Medical history
  const medHx = state.medicalHistory || {}
  const medHxDocumented = medHx.changesSinceLastVisit != null || medHx.conditions?.length || medHx.allergies?.length || medHx.medications
  checks.push({
    label: 'Medical history reviewed and documented',
    status: medHxDocumented ? 'pass' : 'fail'
  })

  // Chief complaint (non-scheduled visits)
  if (state.visitSetup.visitType !== 'scheduled') {
    checks.push({
      label: 'Chief complaint documented',
      status: state.chiefComplaint?.type ? 'pass' : 'fail'
    })
  }

  // Procedure(s) rendered
  const rendered = state.treatmentRendered || []
  checks.push({
    label: 'At least one procedure rendered or treatment-plan entry',
    status: rendered.length || (state.treatmentPlan || []).length ? 'pass' : 'warn',
    detail: rendered.length ? `${rendered.length} CDT code(s) rendered today` : 'No procedures rendered today'
  })

  // ICD-10 for each procedure rendered today
  const unmapped = rendered.filter((p) => p.cdtCode && !lookupCrosswalk(p.cdtCode))
  const recognized = rendered.filter((p) => p.cdtCode && lookupCrosswalk(p.cdtCode))
  const diagnosesPresent = (state.diagnoses || []).length > 0
  if (recognized.length) {
    checks.push({
      label: 'At least one ICD-10 diagnosis documented for rendered procedures',
      status: diagnosesPresent ? 'pass' : 'fail',
      detail: !diagnosesPresent ? 'Diagnoses step is empty — every CDT code rendered today must map to at least one ICD-10.' : ''
    })
  }
  if (unmapped.length) {
    checks.push({
      label: 'All rendered CDT codes are in the crosswalk',
      status: 'warn',
      detail: `Unrecognized codes (no auto-mapping available): ${unmapped.map((p) => p.cdtCode).join(', ')}`
    })
  }

  // Audit flags on the procedures
  const flagged = rendered
    .map((p) => ({ code: p.cdtCode, flag: lookupCrosswalk(p.cdtCode)?.auditFlag }))
    .filter((p) => p.flag)
  if (flagged.length) {
    checks.push({
      label: 'Procedure-specific audit flags',
      status: 'warn',
      detail: flagged.map((p) => `${p.code}: ${p.flag}`).join(' • ')
    })
  }

  // Coding correctness — surface count and tooth arch (hard errors)
  if (rendered.length) {
    const codingIssues = validateTreatmentCoding(rendered)
    checks.push({
      label: 'Coding — surfaces and tooth position valid for each CDT code',
      status: codingIssues.length === 0 ? 'pass' : 'fail',
      detail: codingIssues.length ? codingIssues.map((i) => i.message).join(' • ') : ''
    })

    // Consistency — documented diagnoses reference each code's expected ICD-10 (advisory)
    const dxIssues = diagnosisIcdMismatch(rendered, state.diagnoses)
    if (dxIssues.length) {
      checks.push({
        label: 'Coding — diagnoses align with rendered procedure codes',
        status: 'warn',
        detail: dxIssues.map((i) => i.message).join(' • ')
      })
    }
  }

  // Radiograph ALARA rationale
  const r = state.radiographs || {}
  if (!r.none && r.taken?.length) {
    const missing = r.taken.filter((t) => typeof t === 'object' && !t.reason && !(t.panoIndications?.length))
    checks.push({
      label: 'Every radiograph has a documented ALARA rationale',
      status: missing.length === 0 ? 'pass' : 'fail',
      detail: missing.length ? `Missing rationale on: ${missing.map((t) => t.type).join(', ')}` : ''
    })
  }

  // Consents
  const cdtCodes = [...rendered.map((t) => t.cdtCode), ...(state.treatmentPlan || []).map((t) => t.cdtCode)].filter(Boolean)
  const required = derivedRequiredConsents(cdtCodes)
  const signed = state.signedConsents || []
  const missingConsents = required.filter((id) => !signed.includes(id))
  if (required.length) {
    checks.push({
      label: 'All required consents signed',
      status: missingConsents.length === 0 ? 'pass' : 'fail',
      detail: missingConsents.length ? `Missing: ${missingConsents.join(', ')}` : ''
    })
  }

  // Patient education
  if (state.visitSetup.visitType !== 'scheduled') {
    checks.push({
      label: 'Patient education / counseling topics documented',
      status: (state.patientEducation || []).length ? 'pass' : 'warn',
      detail: !(state.patientEducation || []).length ? 'Recommended for audit defense; required for MCNA EPSDT.' : ''
    })
  }

  // EPSDT specifics
  if (state.visitSetup.patientType === 'epsdt') {
    const e = state.epsdtScreening || {}
    checks.push({
      label: 'EPSDT caries risk level documented',
      status: e.cariesRisk ? 'pass' : 'fail',
      detail: !e.cariesRisk ? 'MCNA Louisiana Medicaid requires explicit caries risk on every EPSDT visit.' : ''
    })
  }

  return checks
}

function statusBadge(status) {
  const map = {
    pass: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: '✓ Pass' },
    fail: { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Fail' },
    warn: { bg: 'bg-amber-100', text: 'text-amber-800', label: '! Warn' }
  }
  return map[status] || map.warn
}

export function computeAuditScore(state) {
  const checks = runChecks(state)
  const counted = checks.filter((c) => c.status === 'pass' || c.status === 'fail')
  if (!counted.length) return { pct: 0, total: 0, passing: 0, failing: 0, warning: checks.filter((c) => c.status === 'warn').length }
  const passing = counted.filter((c) => c.status === 'pass').length
  return {
    pct: Math.round((passing / counted.length) * 100),
    total: counted.length,
    passing,
    failing: counted.length - passing,
    warning: checks.filter((c) => c.status === 'warn').length
  }
}

export default function Audit({ store }) {
  const { state } = store
  const checks = runChecks(state)
  const score = computeAuditScore(state)

  return (
    <div>
      <PageTitle
        title="Audit Checklist"
        subtitle="Live completeness check of the visit's documentation. Resolve failing items before the note is finalized; warnings are advisory."
      />

      <div className="mb-6 p-4 rounded-lg border border-slate-200 bg-white flex items-center gap-4">
        <div className={`text-3xl font-bold ${score.pct >= 90 ? 'text-emerald-600' : score.pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
          {score.pct}%
        </div>
        <div className="text-sm text-slate-600">
          <div><strong>{score.passing}</strong> of {score.total} required checks passing</div>
          {score.failing > 0 && <div className="text-red-700">{score.failing} failing — resolve before signing the note</div>}
          {score.warning > 0 && <div className="text-amber-700">{score.warning} advisory warning(s)</div>}
        </div>
      </div>

      <Section title="Checks">
        <div className="space-y-2">
          {checks.map((c, i) => {
            const b = statusBadge(c.status)
            return (
              <div key={i} className="flex items-start gap-3 p-3 border border-slate-200 rounded">
                <span className={`text-xs font-semibold px-2 py-1 rounded shrink-0 ${b.bg} ${b.text}`}>{b.label}</span>
                <div className="flex-1">
                  <div className="text-sm text-slate-800">{c.label}</div>
                  {c.detail && <div className="text-xs text-slate-500 mt-1">{c.detail}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <div className="mt-6 text-xs text-slate-500">
        Audit logic ported from clinicalsidecarv7.2 and adapted to this app's data shape. Items marked <em>Warn</em> do not block but should be reviewed before payer submission.
      </div>
    </div>
  )
}
