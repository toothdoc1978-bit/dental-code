import { Tile, CheckChip, Section, YesNo, PageTitle } from './shared.jsx'
import {
  EPSDT_RISK_FACTORS_RISK,
  EPSDT_RISK_FACTORS_PROTECTIVE,
  EPSDT_COUNSELING_TOPICS,
  EPSDT_REFERRALS
} from '../data/examDefaults.js'

export default function EpsdtScreening({ store }) {
  const { state, setField, toggleItem } = store
  const e = state.epsdtScreening

  return (
    <div>
      <PageTitle title="EPSDT Screening" subtitle="Required documentation for MCNA Louisiana EPSDT Medicaid" />

      <Section title="Growth & Development">
        <div>
          <label className="text-sm text-slate-600 mb-1 block">Appears age-appropriate / within normal limits?</label>
          <YesNo value={e.developmentWNL} onChange={(v) => setField('epsdtScreening.developmentWNL', v)} />
        </div>
      </Section>

      <Section title="Water Source">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Fluoridated Municipal', 'Well/Non-fluoridated', 'Bottled Water', 'Unknown'].map((w) => (
            <Tile key={w} active={e.waterSource === w} onClick={() => setField('epsdtScreening.waterSource', w)}>{w}</Tile>
          ))}
        </div>
      </Section>

      <Section title="Supplemental Fluoride">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {['Systemic drops/tablets', 'Fluoride toothpaste', 'Professional topical application'].map((s) => (
            <CheckChip key={s} active={e.supplementalFluoride.includes(s)} onClick={() => toggleItem('epsdtScreening.supplementalFluoride', s)}>{s}</CheckChip>
          ))}
        </div>
      </Section>

      <Section title="Caries Risk Assessment" hint="MCNA requires documented risk level">
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: 'low', l: 'LOW', c: 'bg-green-50 border-green-500 text-green-800' },
            { v: 'moderate', l: 'MODERATE', c: 'bg-amber-50 border-amber-500 text-amber-800' },
            { v: 'high', l: 'HIGH', c: 'bg-red-50 border-red-500 text-red-800' }
          ].map((r) => (
            <button
              key={r.v}
              type="button"
              onClick={() => setField('epsdtScreening.cariesRisk', r.v)}
              className={`py-6 rounded-md border-2 font-bold text-lg transition-all ${
                e.cariesRisk === r.v ? `${r.c} ring-2 ring-offset-1` : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500'
              }`}
            >
              {r.l}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Risk & Protective Factors" hint="Risk-increasing factors first; protective factors last">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-red-600">Risk-increasing</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {EPSDT_RISK_FACTORS_RISK.map((r) => (
            <CheckChip key={r} active={e.riskFactors.includes(r)} onClick={() => toggleItem('epsdtScreening.riskFactors', r)}>{r}</CheckChip>
          ))}
        </div>
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">Protective</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EPSDT_RISK_FACTORS_PROTECTIVE.map((r) => (
            <CheckChip key={r} active={e.riskFactors.includes(r)} onClick={() => toggleItem('epsdtScreening.riskFactors', r)}>{r}</CheckChip>
          ))}
        </div>
      </Section>

      <Section title="Prevention Counseling Provided">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EPSDT_COUNSELING_TOPICS.map((t) => (
            <CheckChip key={t} active={e.counselingTopics.includes(t)} onClick={() => toggleItem('epsdtScreening.counselingTopics', t)}>{t}</CheckChip>
          ))}
        </div>
      </Section>

      <Section title="Referrals">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {EPSDT_REFERRALS.map((r) => (
            <CheckChip key={r} active={e.referralsNeeded.includes(r)} onClick={() => toggleItem('epsdtScreening.referralsNeeded', r)}>{r}</CheckChip>
          ))}
        </div>
      </Section>
    </div>
  )
}
