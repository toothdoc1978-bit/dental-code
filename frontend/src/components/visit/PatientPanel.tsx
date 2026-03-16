import React from 'react';
import { Patient, PayerType, PayerGroup } from '../../types/visit';

interface PatientPanelProps {
  patient: Patient;
  onChange: (updates: Partial<Patient>) => void;
}

const PAYER_OPTIONS: PayerType[] = [
  'MCNA',
  'Delta Dental',
  'Cigna',
  'Aetna',
  'MetLife',
  'Self-Pay',
  'Other',
];

function payerToGroup(payer: PayerType): PayerGroup {
  if (payer === 'MCNA') return 'medicaid';
  if (payer === 'Self-Pay') return 'self-pay';
  return 'commercial';
}

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const PatientPanel: React.FC<PatientPanelProps> = ({ patient, onChange }) => {
  const handleDobChange = (dob: string) => {
    const age = calculateAge(dob);
    onChange({ dob, age });
  };

  const handlePayerChange = (payer: PayerType) => {
    const payerGroup = payerToGroup(payer);
    onChange({ payer, payerGroup });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Patient Demographics</span>
        {patient.payerGroup && (
          <span className={`panel-badge ${patient.payerGroup === 'medicaid' ? 'badge-info' : patient.payerGroup === 'self-pay' ? 'badge-warning' : 'badge-success'}`}>
            {patient.payerGroup}
          </span>
        )}
      </div>
      <div className="panel-body">
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label" htmlFor="patient-name">Patient Name</label>
            <input
              id="patient-name"
              type="text"
              className="form-input"
              value={patient.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Last, First"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="patient-dob">Date of Birth</label>
            <input
              id="patient-dob"
              type="date"
              className="form-input"
              value={patient.dob}
              onChange={(e) => handleDobChange(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="patient-age">Age</label>
            <input
              id="patient-age"
              type="number"
              className="form-input"
              value={patient.age}
              readOnly
              tabIndex={-1}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="patient-payer">Payer</label>
            <select
              id="patient-payer"
              className="form-select"
              value={patient.payer}
              onChange={(e) => handlePayerChange(e.target.value as PayerType)}
            >
              <option value="">Select payer...</option>
              {PAYER_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="patient-payer-group">Payer Group</label>
            <input
              id="patient-payer-group"
              type="text"
              className="form-input"
              value={patient.payerGroup || ''}
              readOnly
              tabIndex={-1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPanel;
