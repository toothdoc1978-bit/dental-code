import React, { useState } from 'react';
import { Outcome } from '../../types/visit';

interface OutcomePanelProps {
  outcome: Outcome;
  onChange: (updates: Partial<Outcome>) => void;
}

const POST_OP_TEMPLATES: { label: string; text: string }[] = [
  {
    label: 'Restoration',
    text: 'Avoid chewing on the treated side for 24 hours. Some sensitivity to hot/cold is normal and should subside within a few days. If bite feels high, contact our office. Take OTC pain medication as needed.',
  },
  {
    label: 'Extraction',
    text: 'Bite on gauze for 30-45 minutes. Do not spit, use a straw, or smoke for 24 hours. Soft diet for 48 hours. Rinse gently with warm salt water starting tomorrow. Take prescribed medications as directed. If bleeding persists, contact our office.',
  },
  {
    label: 'Scaling/Root Planing',
    text: 'Some tenderness and sensitivity is expected for a few days. Rinse gently with warm salt water. Avoid hard or crunchy foods for 24 hours. Resume normal brushing and flossing gently. Take OTC pain medication as needed.',
  },
  {
    label: 'Crown/Bridge Prep',
    text: 'Temporary crown has been placed. Avoid sticky foods and chewing gum on the temporary. Brush gently around the temporary. If the temporary comes off, contact our office. Some sensitivity is normal.',
  },
  {
    label: 'Root Canal',
    text: 'Some discomfort is normal for a few days. Avoid chewing on the treated tooth until a permanent restoration is placed. Take prescribed medications as directed. If swelling or severe pain develops, contact our office immediately.',
  },
];

const OutcomePanel: React.FC<OutcomePanelProps> = ({ outcome, onChange }) => {
  const [newFollowup, setNewFollowup] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ text: e.target.value });
  };

  const handlePostOpMethodChange = (method: Outcome['postOpMethod']) => {
    onChange({ postOpMethod: method });
  };

  const handlePostOpInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ postOpInstructions: e.target.value });
  };

  const handleAddFollowup = () => {
    const trimmed = newFollowup.trim();
    if (!trimmed || outcome.followup.includes(trimmed)) return;
    onChange({ followup: [...outcome.followup, trimmed] });
    setNewFollowup('');
  };

  const handleFollowupKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFollowup();
    }
  };

  const handleRemoveFollowup = (item: string) => {
    onChange({ followup: outcome.followup.filter((f) => f !== item) });
  };

  const handleApplyTemplate = (text: string) => {
    onChange({ postOpInstructions: text });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Outcome</span>
      </div>
      <div className="panel-body">
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" htmlFor="outcome-text">
            Outcome Summary
          </label>
          <textarea
            id="outcome-text"
            className="form-textarea"
            value={outcome.text}
            onChange={handleTextChange}
            placeholder="Document the outcome of the visit"
            rows={3}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Follow-Up Items</label>
          {outcome.followup.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {outcome.followup.map((item) => (
                <span key={item} className="tag">
                  {item}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => handleRemoveFollowup(item)}
                    aria-label={`Remove follow-up item: ${item}`}
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
              value={newFollowup}
              onChange={(e) => setNewFollowup(e.target.value)}
              onKeyDown={handleFollowupKeyDown}
              placeholder="Add follow-up item"
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-outline btn-sm" onClick={handleAddFollowup}>
              Add
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Post-Op Instructions Method</label>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            {(['verbal', 'written', 'both'] as const).map((method) => (
              <div key={method} className="form-checkbox-group">
                <input
                  id={`postop-method-${method}`}
                  type="radio"
                  name="postOpMethod"
                  checked={outcome.postOpMethod === method}
                  onChange={() => handlePostOpMethodChange(method)}
                />
                <label htmlFor={`postop-method-${method}`}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="postop-instructions">
            Post-Op Instructions
          </label>
          <div className="btn-group" style={{ marginTop: '6px', marginBottom: '8px' }}>
            {POST_OP_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleApplyTemplate(tmpl.text)}
              >
                {tmpl.label}
              </button>
            ))}
          </div>
          <textarea
            id="postop-instructions"
            className="form-textarea"
            value={outcome.postOpInstructions}
            onChange={handlePostOpInstructionsChange}
            placeholder="Post-operative instructions for the patient"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default OutcomePanel;
