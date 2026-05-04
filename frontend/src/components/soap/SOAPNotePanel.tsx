import React, { useState } from 'react';
import { SOAPNote } from '../../types/visit';

interface Props {
  note: SOAPNote;
  onEdit: (section: keyof SOAPNote, value: string) => void;
  locked: boolean;
}

export default function SOAPNotePanel({ note, onEdit, locked }: Props) {
  const [editingSection, setEditingSection] = useState<keyof SOAPNote | null>(null);
  const [copied, setCopied] = useState(false);

  const sections: { key: keyof SOAPNote; label: string; color: string }[] = [
    { key: 'subjective', label: 'S — Subjective', color: '#7c3aed' },
    { key: 'objective', label: 'O — Objective', color: '#2563eb' },
    { key: 'assessment', label: 'A — Assessment', color: '#d97706' },
    { key: 'plan', label: 'P — Plan', color: '#059669' },
  ];

  const handleCopyAll = () => {
    const fullNote = sections
      .map(s => `${s.label.split(' — ')[0]}:\n${note[s.key]}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasContent = note.subjective || note.objective || note.assessment || note.plan;

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">SOAP Note</span>
        <div className="btn-group">
          {locked && <span className="panel-badge badge-success">LOCKED</span>}
          {hasContent && (
            <button className="btn btn-outline btn-sm copy-btn" onClick={handleCopyAll}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          )}
        </div>
      </div>
      <div className="panel-body">
        {!hasContent ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">
              Enter visit data to generate SOAP note
            </div>
          </div>
        ) : (
          sections.map(({ key, label, color }) => (
            <div key={key} className="soap-section">
              <div
                className="soap-label"
                style={{ color, borderBottomColor: `${color}33` }}
              >
                {label}
                {!locked && note[key] && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px' }}
                    onClick={() =>
                      setEditingSection(editingSection === key ? null : key)
                    }
                  >
                    {editingSection === key ? 'Done' : 'Edit'}
                  </button>
                )}
              </div>
              {editingSection === key && !locked ? (
                <textarea
                  className="form-textarea"
                  style={{ width: '100%', minHeight: 80 }}
                  value={note[key]}
                  onChange={e => onEdit(key, e.target.value)}
                />
              ) : (
                <div className="soap-text">{note[key] || '—'}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
