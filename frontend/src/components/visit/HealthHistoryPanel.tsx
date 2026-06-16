import React, { useState } from 'react';
import { HealthHistory } from '../../types/visit';

interface HealthHistoryPanelProps {
  history: HealthHistory;
  onChange: (updates: Partial<HealthHistory>) => void;
}

const PREDEFINED_RISK_FLAGS = [
  'Diabetes',
  'Radiation history',
  'Immunosuppression',
  'Bleeding disorder',
  'Bisphosphonate use',
  'Cardiac conditions',
  'Pregnancy',
];

// Reusable chip-list editor (medications, allergies, conditions all share it).
function ChipListField({
  label,
  placeholder,
  items,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim();
    if (!value || items.includes(value)) return;
    onAdd(value);
    setDraft('');
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label className="form-label">{label}</label>
      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          {items.map((item) => (
            <span className="tag" key={item}>
              {item}
              <button type="button" className="tag-remove" onClick={() => onRemove(item)}>
                x
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <input
          type="text"
          className="form-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}

const HealthHistoryPanel: React.FC<HealthHistoryPanelProps> = ({ history, onChange }) => {
  const [customFlag, setCustomFlag] = useState('');

  const riskFlags = history.riskFlags || [];
  const medications = history.medications || [];
  const allergies = history.allergies || [];
  const conditions = history.activeConditions || [];

  const toggleRiskFlag = (flag: string) => {
    const updated = riskFlags.includes(flag)
      ? riskFlags.filter((f) => f !== flag)
      : [...riskFlags, flag];
    onChange({ riskFlags: updated });
  };

  const handleAddCustomFlag = () => {
    const flag = customFlag.trim();
    if (!flag || riskFlags.includes(flag)) return;
    onChange({ riskFlags: [...riskFlags, flag] });
    setCustomFlag('');
  };

  const addTo = (field: 'medications' | 'allergies' | 'activeConditions', current: string[], value: string) =>
    onChange({ [field]: [...current, value] } as Partial<HealthHistory>);

  const removeFrom = (field: 'medications' | 'allergies' | 'activeConditions', current: string[], value: string) =>
    onChange({ [field]: current.filter((v) => v !== value) } as Partial<HealthHistory>);

  const updateLab = (key: 'inr' | 'hba1c', raw: string) => {
    const labs = { ...(history.labs || {}) };
    const value = raw === '' ? NaN : Number(raw);
    if (Number.isNaN(value)) delete labs[key];
    else labs[key] = value;
    onChange({ labs });
  };

  const customFlags = riskFlags.filter((f) => !PREDEFINED_RISK_FLAGS.includes(f));
  const flagCount = riskFlags.length;

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Health History</span>
        {flagCount > 0 && (
          <span className="panel-badge badge-warning">
            {flagCount} flag{flagCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="panel-body">
        {/* Risk Flags */}
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Risk Flags</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {PREDEFINED_RISK_FLAGS.map((flag) => (
              <div className="form-checkbox-group" key={flag}>
                <input
                  id={`risk-flag-${flag}`}
                  type="checkbox"
                  checked={riskFlags.includes(flag)}
                  onChange={() => toggleRiskFlag(flag)}
                />
                <label htmlFor={`risk-flag-${flag}`}>{flag}</label>
              </div>
            ))}
          </div>

          {customFlags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {customFlags.map((flag) => (
                <span className="tag" key={flag}>
                  {flag}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => onChange({ riskFlags: riskFlags.filter((f) => f !== flag) })}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input
              type="text"
              className="form-input"
              value={customFlag}
              onChange={(e) => setCustomFlag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomFlag();
                }
              }}
              placeholder="Add custom risk flag..."
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-outline btn-sm" onClick={handleAddCustomFlag}>
              Add
            </button>
          </div>
        </div>

        {/* Pregnancy trimester — shown when Pregnancy is flagged */}
        {riskFlags.includes('Pregnancy') && (
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="pregnancy-trimester">
              Pregnancy Trimester
            </label>
            <select
              id="pregnancy-trimester"
              className="form-select"
              style={{ marginTop: '8px' }}
              value={history.pregnancyTrimester ?? ''}
              onChange={(e) =>
                onChange({
                  pregnancyTrimester: e.target.value ? (Number(e.target.value) as 1 | 2 | 3) : undefined,
                })
              }
            >
              <option value="">Not specified</option>
              <option value="1">First</option>
              <option value="2">Second</option>
              <option value="3">Third</option>
            </select>
          </div>
        )}

        {/* Medications */}
        <ChipListField
          label="Medications"
          placeholder="Add medication (e.g. Warfarin, Fosamax)..."
          items={medications}
          onAdd={(v) => addTo('medications', medications, v)}
          onRemove={(v) => removeFrom('medications', medications, v)}
        />

        {/* Allergies */}
        <ChipListField
          label="Allergies"
          placeholder="Add allergy (e.g. Penicillin)..."
          items={allergies}
          onAdd={(v) => addTo('allergies', allergies, v)}
          onRemove={(v) => removeFrom('allergies', allergies, v)}
        />

        {/* Active Conditions */}
        <ChipListField
          label="Active Conditions"
          placeholder="Add active condition..."
          items={conditions}
          onAdd={(v) => addTo('activeConditions', conditions, v)}
          onRemove={(v) => removeFrom('activeConditions', conditions, v)}
        />

        {/* Relevant Labs */}
        <div>
          <label className="form-label">Relevant Labs</label>
          <div className="form-grid" style={{ marginTop: '8px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="lab-inr">INR</label>
              <input
                id="lab-inr"
                type="number"
                step="0.1"
                className="form-input"
                value={history.labs?.inr ?? ''}
                placeholder="e.g. 2.5"
                onChange={(e) => updateLab('inr', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lab-hba1c">HbA1c (%)</label>
              <input
                id="lab-hba1c"
                type="number"
                step="0.1"
                className="form-input"
                value={history.labs?.hba1c ?? ''}
                placeholder="e.g. 7.0"
                onChange={(e) => updateLab('hba1c', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthHistoryPanel;
