import React from 'react';
import { AuditRisk } from '../../types/visit';

interface Props {
  risk: AuditRisk;
}

export default function AuditRiskPanel({ risk }: Props) {
  const levelLabel = {
    low: 'LOW RISK',
    medium: 'MODERATE RISK — Review Recommended',
    high: 'HIGH RISK — Payer Review Likely',
  };

  const levelIcon = {
    low: '\u2705',
    medium: '\u26A0\uFE0F',
    high: '\u26D4',
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Audit Risk Assessment</span>
        <span
          className={`panel-badge ${
            risk.level === 'low'
              ? 'badge-success'
              : risk.level === 'medium'
              ? 'badge-warning'
              : 'badge-danger'
          }`}
        >
          {risk.level.toUpperCase()}
        </span>
      </div>
      <div className="panel-body">
        <div className={`audit-risk ${risk.level}`}>
          <div className={`audit-risk-title ${risk.level}`}>
            {levelIcon[risk.level]} {levelLabel[risk.level]}
          </div>

          {risk.factors.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Risk Factors
              </div>
              <ul className="audit-list">
                {risk.factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </>
          )}

          {risk.recommendations.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Recommendations
              </div>
              <ul className="audit-list">
                {risk.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
