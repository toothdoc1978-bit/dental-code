import React, { useState } from 'react';
import { Attestation, ContraindicationAlert } from '../../types/visit';

interface Props {
  attestation?: Attestation;
  hasModifications: boolean;
  claimReadinessScore: number;
  criticalAlerts: ContraindicationAlert[];
  onAttest: (provider: string, editsAfterAI: boolean) => void;
}

export default function AttestationPanel({
  attestation,
  hasModifications,
  claimReadinessScore,
  criticalAlerts,
  onAttest,
}: Props) {
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [safetyAck, setSafetyAck] = useState(false);

  const isLocked = attestation?.locked === true;
  const hasCritical = criticalAlerts.length > 0;
  const canAttest = confirmChecked && (!hasCritical || safetyAck);

  const handleAttest = () => {
    if (!canAttest) return;
    onAttest('Dr. Chad Gardner', hasModifications);
  };

  return (
    <div className="panel">
      <div className="panel-header" style={{ background: '#111827' }}>
        <span className="panel-title" style={{ color: 'white' }}>
          Provider Attestation
        </span>
        {isLocked && (
          <span className="panel-badge badge-success">ATTESTED & LOCKED</span>
        )}
      </div>
      <div
        className="panel-body"
        style={{
          background: isLocked ? '#f0fdf4' : '#1f2937',
          color: isLocked ? '#166534' : 'white',
        }}
      >
        {isLocked ? (
          <div>
            <div className="attestation-locked">
              Note Attested & Locked
            </div>
            <div style={{ marginTop: 12, fontSize: 13 }}>
              <div>
                <strong>Provider:</strong> {attestation!.provider}
              </div>
              <div>
                <strong>Timestamp:</strong>{' '}
                {new Date(attestation!.timestamp).toLocaleString()}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                {attestation!.editsAfterAI
                  ? 'AI-generated, provider-edited'
                  : 'AI-generated, unmodified'}
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                padding: 8,
                background: '#dcfce7',
                borderRadius: 6,
                fontSize: 12,
                color: '#166534',
              }}
            >
              This note is locked. No further AI modifications are permitted.
              Copy to Dentrix clipboard when ready.
            </div>
          </div>
        ) : (
          <div>
            {/* Critical clinical safety alerts — must be acknowledged */}
            {hasCritical && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: 10,
                  borderRadius: 6,
                  marginBottom: 12,
                  fontSize: 13,
                  border: '1px solid #dc2626',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  {'⛔'} {criticalAlerts.length} critical clinical safety alert
                  {criticalAlerts.length !== 1 ? 's' : ''} unresolved
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {criticalAlerts.map(a => (
                    <li key={a.id}>
                      {a.category}: {a.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pre-attestation warnings */}
            {claimReadinessScore < 80 && (
              <div
                style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: 10,
                  borderRadius: 6,
                  marginBottom: 12,
                  fontSize: 13,
                }}
              >
                Claim readiness score is {claimReadinessScore}%. Review
                outstanding items before attesting.
              </div>
            )}

            {hasModifications && (
              <div
                style={{
                  background: '#dbeafe',
                  color: '#1e40af',
                  padding: 10,
                  borderRadius: 6,
                  marginBottom: 12,
                  fontSize: 13,
                }}
              >
                Provider modifications detected. Attestation will record
                this note as "AI-generated, provider-edited."
              </div>
            )}

            <div style={{ fontSize: 13, marginBottom: 16, color: '#d1d5db' }}>
              By attesting, you confirm that:
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>
                  All clinical findings are accurate and based on your
                  examination
                </li>
                <li>
                  All procedures documented were actually performed
                </li>
                <li>
                  Diagnosis codes are supported by documented clinical evidence
                </li>
                <li>
                  The SOAP note accurately represents the encounter
                </li>
              </ul>
            </div>

            {hasCritical && (
              <div className="form-checkbox-group" style={{ marginBottom: 12 }}>
                <input
                  type="checkbox"
                  id="attest-safety-ack"
                  checked={safetyAck}
                  onChange={e => setSafetyAck(e.target.checked)}
                />
                <label htmlFor="attest-safety-ack" style={{ color: 'white', fontSize: 14 }}>
                  I have reviewed the critical clinical safety alert
                  {criticalAlerts.length !== 1 ? 's' : ''} above and addressed
                  {criticalAlerts.length !== 1 ? ' them' : ' it'} clinically
                </label>
              </div>
            )}

            <div className="form-checkbox-group" style={{ marginBottom: 16 }}>
              <input
                type="checkbox"
                id="attest-confirm"
                checked={confirmChecked}
                onChange={e => setConfirmChecked(e.target.checked)}
              />
              <label htmlFor="attest-confirm" style={{ color: 'white', fontSize: 14 }}>
                I have reviewed all AI-generated content and confirm its
                accuracy
              </label>
            </div>

            <button
              className="btn btn-success"
              style={{ width: '100%', padding: 12, fontSize: 15 }}
              onClick={handleAttest}
              disabled={!canAttest}
            >
              Attest & Lock Note
            </button>

            <div
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: '#6b7280',
                marginTop: 8,
              }}
            >
              Digital signature: Dr. Chad Gardner, DDS • {new Date().toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
