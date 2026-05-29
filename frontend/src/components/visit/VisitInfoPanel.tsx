import React from 'react';
import { VisitInfo } from '../../types/visit';

interface VisitInfoPanelProps {
  visitInfo: VisitInfo;
  patientAge: number;
  onChange: (updates: Partial<VisitInfo>) => void;
}

const PROVIDERS: VisitInfo['provider'][] = ['Dr. Chad Gardner', 'Dr. Gardner'];

const VisitInfoPanel: React.FC<VisitInfoPanelProps> = ({ visitInfo, patientAge, onChange }) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Visit Information</span>
        {patientAge < 18 && (
          <span className="panel-badge badge-warning">Minor (age {patientAge})</span>
        )}
      </div>
      <div className="panel-body">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="visit-dos">Date of Service</label>
            <input
              id="visit-dos"
              type="date"
              className="form-input"
              value={visitInfo.dos}
              onChange={(e) => onChange({ dos: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="visit-provider">Provider</label>
            <select
              id="visit-provider"
              className="form-select"
              value={visitInfo.provider}
              onChange={(e) => onChange({ provider: e.target.value as VisitInfo['provider'] })}
            >
              <option value="">Select provider...</option>
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="visit-complaint">Chief Complaint</label>
            <input
              id="visit-complaint"
              type="text"
              className="form-input"
              value={visitInfo.chiefComplaint}
              onChange={(e) => onChange({ chiefComplaint: e.target.value })}
              placeholder="Patient's chief complaint..."
            />
          </div>

          <div className="form-group">
            <div className="form-checkbox-group">
              <input
                id="visit-guardian"
                type="checkbox"
                checked={visitInfo.guardianPresent}
                onChange={(e) => {
                  const updates: Partial<VisitInfo> = { guardianPresent: e.target.checked };
                  if (!e.target.checked) {
                    updates.guardianRelation = undefined;
                  }
                  onChange(updates);
                }}
              />
              <label htmlFor="visit-guardian">Guardian Present</label>
            </div>
          </div>

          {visitInfo.guardianPresent && (
            <div className="form-group">
              <label className="form-label" htmlFor="visit-guardian-relation">Guardian Relation</label>
              <input
                id="visit-guardian-relation"
                type="text"
                className="form-input"
                value={visitInfo.guardianRelation || ''}
                onChange={(e) => onChange({ guardianRelation: e.target.value })}
                placeholder="e.g., Mother, Father, Legal guardian"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitInfoPanel;
