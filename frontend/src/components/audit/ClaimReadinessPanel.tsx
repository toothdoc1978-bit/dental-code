import React from 'react';
import { ClaimReadiness } from '../../types/visit';

interface Props {
  readiness: ClaimReadiness;
}

export default function ClaimReadinessPanel({ readiness }: Props) {
  const scoreLevel =
    readiness.score >= 80 ? 'high' : readiness.score >= 50 ? 'medium' : 'low';

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Claim Readiness</span>
        <span
          className={`panel-badge ${
            scoreLevel === 'high'
              ? 'badge-success'
              : scoreLevel === 'medium'
              ? 'badge-warning'
              : 'badge-danger'
          }`}
        >
          {readiness.score}%
        </span>
      </div>
      <div className="panel-body">
        {/* Score display */}
        <div className="readiness-score">
          <div className={`readiness-number ${scoreLevel}`}>
            {readiness.score}%
          </div>
          <div className="readiness-bar">
            <div
              className={`readiness-fill ${scoreLevel}`}
              style={{ width: `${readiness.score}%` }}
            />
          </div>
        </div>

        {/* Critical checks */}
        {readiness.critical.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 8,
                color: '#dc2626',
              }}
            >
              Critical (Must Pass)
            </div>
            {readiness.critical.map((item, i) => (
              <div key={i} className="check-item">
                <span className={`check-icon ${item.passed ? 'pass' : 'fail'}`}>
                  {item.passed ? '\u2713' : '\u2717'}
                </span>
                <div>
                  <div>{item.label}</div>
                  {item.details && (
                    <div className="check-details">{item.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Advisory checks */}
        {readiness.advisory.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 8,
                color: '#d97706',
              }}
            >
              Advisory (Should Pass)
            </div>
            {readiness.advisory.map((item, i) => (
              <div key={i} className="check-item">
                <span className={`check-icon ${item.passed ? 'pass' : 'fail'}`}>
                  {item.passed ? '\u2713' : '\u2717'}
                </span>
                <div>
                  <div>{item.label}</div>
                  {item.details && (
                    <div className="check-details">{item.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
