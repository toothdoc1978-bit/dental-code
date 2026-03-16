import React, { useState } from 'react';
import { Anesthesia } from '../../types/visit';

interface AnesthesiaPanelProps {
  anesthesia: Anesthesia[];
  onAdd: (a: Anesthesia) => void;
}

const ANESTHESIA_TYPES: Anesthesia['type'][] = ['local', 'topical', 'block', 'infiltration'];

const AGENT_OPTIONS = [
  'Lidocaine 2% w/ epi',
  'Articaine 4% w/ epi',
  'Mepivacaine 3% plain',
  'Bupivacaine 0.5% w/ epi',
];

const AnesthesiaPanel: React.FC<AnesthesiaPanelProps> = ({ anesthesia, onAdd }) => {
  const [type, setType] = useState<Anesthesia['type']>('local');
  const [site, setSite] = useState('');
  const [agent, setAgent] = useState(AGENT_OPTIONS[0]);
  const [carpules, setCarpules] = useState(1);

  const handleSubmit = () => {
    if (!site.trim()) return;
    onAdd({
      type,
      site: site.trim(),
      agent,
      carpules,
    });
    setType('local');
    setSite('');
    setAgent(AGENT_OPTIONS[0]);
    setCarpules(1);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Anesthesia</span>
        {anesthesia.length > 0 && (
          <span className="panel-badge badge-info">{anesthesia.length}</span>
        )}
      </div>
      <div className="panel-body">
        {/* Existing anesthesia records */}
        {anesthesia.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {anesthesia.map((a, idx) => (
              <div key={idx} className="procedure-item">
                <div className="procedure-header">
                  <div>
                    <span className="procedure-code">
                      {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                    </span>
                    <span className="procedure-desc">{a.site}</span>
                  </div>
                </div>
                <div className="procedure-detail">
                  {a.agent} — {a.carpules} carpule{a.carpules !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new anesthesia form */}
        <div style={{ borderTop: anesthesia.length > 0 ? '1px solid var(--gray-200)' : 'none', paddingTop: anesthesia.length > 0 ? '16px' : '0' }}>
          <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Add Anesthesia Record</label>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="anes-type">Type</label>
              <select
                id="anes-type"
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as Anesthesia['type'])}
              >
                {ANESTHESIA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="anes-site">Site</label>
              <input
                id="anes-site"
                type="text"
                className="form-input"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="e.g., #14 buccal"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="anes-agent">Agent</label>
              <select
                id="anes-agent"
                className="form-select"
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
              >
                {AGENT_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="anes-carpules">Carpules</label>
              <input
                id="anes-carpules"
                type="number"
                className="form-input"
                min={1}
                max={10}
                value={carpules}
                onChange={(e) => setCarpules(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!site.trim()}
            >
              Add Anesthesia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnesthesiaPanel;
