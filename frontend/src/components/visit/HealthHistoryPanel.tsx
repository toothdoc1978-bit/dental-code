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

const HealthHistoryPanel: React.FC<HealthHistoryPanelProps> = ({ history, onChange }) => {
  const [customFlag, setCustomFlag] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const toggleRiskFlag = (flag: string) => {
    const current = history.riskFlags || [];
    const updated = current.includes(flag)
      ? current.filter((f) => f !== flag)
      : [...current, flag];
    onChange({ riskFlags: updated });
  };

  const handleAddCustomFlag = () => {
    const flag = customFlag.trim();
    if (!flag) return;
    if ((history.riskFlags || []).includes(flag)) return;
    onChange({ riskFlags: [...(history.riskFlags || []), flag] });
    setCustomFlag('');
  };

  const handleRemoveFlag = (flag: string) => {
    onChange({ riskFlags: (history.riskFlags || []).filter((f) => f !== flag) });
  };

  const handleAddCondition = () => {
    const condition = newCondition.trim();
    if (!condition) return;
    if ((history.activeConditions || []).includes(condition)) return;
    onChange({ activeConditions: [...(history.activeConditions || []), condition] });
    setNewCondition('');
  };

  const handleRemoveCondition = (condition: string) => {
    onChange({ activeConditions: (history.activeConditions || []).filter((c) => c !== condition) });
  };

  const handleConditionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCondition();
    }
  };

  const handleCustomFlagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomFlag();
    }
  };

  const customFlags = (history.riskFlags || []).filter(
    (f) => !PREDEFINED_RISK_FLAGS.includes(f)
  );

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Health History</span>
        {(history.riskFlags || []).length > 0 && (
          <span className="panel-badge badge-warning">
            {(history.riskFlags || []).length} flag{(history.riskFlags || []).length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="panel-body">
        {/* Risk Flags Section */}
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Risk Flags</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {PREDEFINED_RISK_FLAGS.map((flag) => (
              <div className="form-checkbox-group" key={flag}>
                <input
                  id={`risk-flag-${flag}`}
                  type="checkbox"
                  checked={(history.riskFlags || []).includes(flag)}
                  onChange={() => toggleRiskFlag(flag)}
                />
                <label htmlFor={`risk-flag-${flag}`}>{flag}</label>
              </div>
            ))}
          </div>

          {/* Custom risk flags */}
          {customFlags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {customFlags.map((flag) => (
                <span className="tag" key={flag}>
                  {flag}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => handleRemoveFlag(flag)}
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
              onKeyDown={handleCustomFlagKeyDown}
              placeholder="Add custom risk flag..."
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleAddCustomFlag}
            >
              Add
            </button>
          </div>
        </div>

        {/* Active Conditions Section */}
        <div>
          <label className="form-label">Active Conditions</label>

          {(history.activeConditions || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {(history.activeConditions || []).map((condition) => (
                <span className="tag" key={condition}>
                  {condition}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => handleRemoveCondition(condition)}
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
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyDown={handleConditionKeyDown}
              placeholder="Add active condition..."
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleAddCondition}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthHistoryPanel;
