import React, { useState } from 'react';
import { Radiograph, RadiographType } from '../../types/visit';

interface RadiographPanelProps {
  radiographs: Radiograph[];
  onAdd: (rad: Omit<Radiograph, 'id'>) => void;
  onRemove: (id: string) => void;
}

const RADIOGRAPH_TYPES: RadiographType[] = ['PA', 'BW', 'Pano', 'CBCT', 'Occlusal', 'Cephalometric'];

const ALARA_CHECKS = [
  'Lead apron used',
  'Thyroid collar used',
  'Rectangular collimation',
  'Digital sensor',
  'Patient-specific indication documented',
  'ADA/FDA selection criteria met',
];

const RadiographPanel: React.FC<RadiographPanelProps> = ({ radiographs, onAdd, onRemove }) => {
  const [type, setType] = useState<RadiographType>('PA');
  const [date, setDate] = useState('');
  const [justification, setJustification] = useState<string[]>([]);
  const [justInput, setJustInput] = useState('');
  const [alaraChecks, setAlaraChecks] = useState<string[]>([]);

  const toggleAlara = (check: string) => {
    setAlaraChecks((prev) =>
      prev.includes(check) ? prev.filter((c) => c !== check) : [...prev, check]
    );
  };

  const handleAddJustification = () => {
    const text = justInput.trim();
    if (!text) return;
    setJustification((prev) => [...prev, text]);
    setJustInput('');
  };

  const handleRemoveJustification = (index: number) => {
    setJustification((prev) => prev.filter((_, i) => i !== index));
  };

  const handleJustificationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddJustification();
    }
  };

  const handleSubmit = () => {
    if (!date) return;
    onAdd({
      type,
      date,
      justification,
      alaraChecks,
    });
    setType('PA');
    setDate('');
    setJustification([]);
    setJustInput('');
    setAlaraChecks([]);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Radiographs</span>
        {radiographs.length > 0 && (
          <span className="panel-badge badge-info">{radiographs.length}</span>
        )}
      </div>
      <div className="panel-body">
        {/* Existing radiographs */}
        {radiographs.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {radiographs.map((rad) => (
              <div key={rad.id} className="procedure-item">
                <div className="procedure-header">
                  <div>
                    <span className="procedure-code">{rad.type}</span>
                    <span className="procedure-desc">{rad.date}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => onRemove(rad.id)}
                  >
                    Remove
                  </button>
                </div>
                {rad.justification.length > 0 && (
                  <div className="procedure-detail">
                    Justification: {rad.justification.join('; ')}
                  </div>
                )}
                {rad.alaraChecks.length > 0 && (
                  <div className="procedure-detail" style={{ marginTop: '4px' }}>
                    ALARA: {rad.alaraChecks.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add new radiograph form */}
        <div style={{ borderTop: radiographs.length > 0 ? '1px solid var(--gray-200)' : 'none', paddingTop: radiographs.length > 0 ? '16px' : '0' }}>
          <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Add Radiograph</label>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="rad-type">Type</label>
              <select
                id="rad-type"
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as RadiographType)}
              >
                {RADIOGRAPH_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rad-date">Date</label>
              <input
                id="rad-date"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Justification */}
          <div style={{ marginTop: '12px' }}>
            <label className="form-label">Justification</label>
            {justification.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {justification.map((j, idx) => (
                  <span className="tag" key={idx}>
                    {j}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => handleRemoveJustification(idx)}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                className="form-input"
                value={justInput}
                onChange={(e) => setJustInput(e.target.value)}
                onKeyDown={handleJustificationKeyDown}
                placeholder="Add justification reason..."
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleAddJustification}
              >
                Add
              </button>
            </div>
          </div>

          {/* ALARA Checks */}
          <div style={{ marginTop: '12px' }}>
            <label className="form-label">ALARA Checks</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              {ALARA_CHECKS.map((check) => (
                <div className="form-checkbox-group" key={check}>
                  <input
                    id={`alara-${check}`}
                    type="checkbox"
                    checked={alaraChecks.includes(check)}
                    onChange={() => toggleAlara(check)}
                  />
                  <label htmlFor={`alara-${check}`}>{check}</label>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!date}
            >
              Add Radiograph
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiographPanel;
