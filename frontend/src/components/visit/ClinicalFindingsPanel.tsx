import React, { useState } from 'react';
import { ClinicalFindings } from '../../types/visit';

interface ClinicalFindingsPanelProps {
  findings: ClinicalFindings;
  onChange: (updates: Partial<ClinicalFindings>) => void;
}

const CARIES_RISK_OPTIONS: ClinicalFindings['cariesRisk'][] = ['low', 'moderate', 'high'];
const CARIES_DEPTH_OPTIONS: NonNullable<ClinicalFindings['cariesDepth']>[] = ['enamel', 'dentin', 'pulp'];
const PERIO_STATUS_OPTIONS: { value: NonNullable<ClinicalFindings['perioStatus']>; label: string }[] = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'gingivitis', label: 'Gingivitis' },
  { value: 'mild_periodontitis', label: 'Mild Periodontitis' },
  { value: 'moderate_periodontitis', label: 'Moderate Periodontitis' },
  { value: 'severe_periodontitis', label: 'Severe Periodontitis' },
];

const ClinicalFindingsPanel: React.FC<ClinicalFindingsPanelProps> = ({ findings, onChange }) => {
  const [newTooth, setNewTooth] = useState('');
  const [newDepths, setNewDepths] = useState('');

  const handleAddProbingDepth = () => {
    const tooth = newTooth.trim();
    const depths = newDepths
      .split(',')
      .map((d) => parseInt(d.trim(), 10))
      .filter((d) => !isNaN(d));

    if (!tooth || depths.length === 0) return;

    const updated = { ...(findings.probingDepths || {}), [tooth]: depths };
    onChange({ probingDepths: updated });
    setNewTooth('');
    setNewDepths('');
  };

  const handleRemoveProbingDepth = (tooth: string) => {
    const updated = { ...(findings.probingDepths || {}) };
    delete updated[tooth];
    onChange({ probingDepths: updated });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Clinical Findings</span>
        <span className={`panel-badge ${findings.cariesRisk === 'high' ? 'badge-danger' : findings.cariesRisk === 'moderate' ? 'badge-warning' : 'badge-success'}`}>
          {findings.cariesRisk} risk
        </span>
      </div>
      <div className="panel-body">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="cf-caries-risk">Caries Risk</label>
            <select
              id="cf-caries-risk"
              className="form-select"
              value={findings.cariesRisk}
              onChange={(e) => onChange({ cariesRisk: e.target.value as ClinicalFindings['cariesRisk'] })}
            >
              {CARIES_RISK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cf-caries-depth">Caries Depth</label>
            <select
              id="cf-caries-depth"
              className="form-select"
              value={findings.cariesDepth || ''}
              onChange={(e) => onChange({ cariesDepth: (e.target.value || undefined) as ClinicalFindings['cariesDepth'] })}
            >
              <option value="">Not specified</option>
              {CARIES_DEPTH_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="cf-perio-status">Periodontal Status</label>
            <select
              id="cf-perio-status"
              className="form-select"
              value={findings.perioStatus || ''}
              onChange={(e) => onChange({ perioStatus: (e.target.value || undefined) as ClinicalFindings['perioStatus'] })}
            >
              <option value="">Not assessed</option>
              {PERIO_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="form-checkbox-group">
              <input
                id="cf-bop"
                type="checkbox"
                checked={findings.bop || false}
                onChange={(e) => {
                  const updates: Partial<ClinicalFindings> = { bop: e.target.checked };
                  if (!e.target.checked) {
                    updates.bopPercentage = undefined;
                  }
                  onChange(updates);
                }}
              />
              <label htmlFor="cf-bop">Bleeding on Probing (BOP)</label>
            </div>
          </div>

          {findings.bop && (
            <div className="form-group">
              <label className="form-label" htmlFor="cf-bop-pct">BOP Percentage</label>
              <input
                id="cf-bop-pct"
                type="number"
                className="form-input"
                min={0}
                max={100}
                value={findings.bopPercentage ?? ''}
                onChange={(e) => onChange({ bopPercentage: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                placeholder="%"
              />
            </div>
          )}

          <div className="form-group">
            <div className="form-checkbox-group">
              <input
                id="cf-bone-loss"
                type="checkbox"
                checked={findings.boneLoss || false}
                onChange={(e) => {
                  const updates: Partial<ClinicalFindings> = { boneLoss: e.target.checked };
                  if (!e.target.checked) {
                    updates.boneLossDescription = undefined;
                  }
                  onChange(updates);
                }}
              />
              <label htmlFor="cf-bone-loss">Bone Loss</label>
            </div>
          </div>

          {findings.boneLoss && (
            <div className="form-group">
              <label className="form-label" htmlFor="cf-bone-loss-desc">Bone Loss Description</label>
              <input
                id="cf-bone-loss-desc"
                type="text"
                className="form-input"
                value={findings.boneLossDescription || ''}
                onChange={(e) => onChange({ boneLossDescription: e.target.value })}
                placeholder="e.g., Generalized moderate horizontal"
              />
            </div>
          )}
        </div>

        {/* Probing Depths Section */}
        <div style={{ marginTop: '16px' }}>
          <label className="form-label">Probing Depths</label>

          {findings.probingDepths && Object.keys(findings.probingDepths).length > 0 && (
            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
              {Object.entries(findings.probingDepths).map(([tooth, depths]) => (
                <div key={tooth} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="tag">
                    #{tooth}: {depths.join(', ')}mm
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => handleRemoveProbingDepth(tooth)}
                    >
                      x
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="form-grid-3" style={{ marginTop: '8px' }}>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                value={newTooth}
                onChange={(e) => setNewTooth(e.target.value)}
                placeholder="Tooth #"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                value={newDepths}
                onChange={(e) => setNewDepths(e.target.value)}
                placeholder="Depths (e.g., 3,4,3,5,4,3)"
              />
            </div>
            <div className="form-group">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleAddProbingDepth}
                style={{ alignSelf: 'flex-end' }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalFindingsPanel;
