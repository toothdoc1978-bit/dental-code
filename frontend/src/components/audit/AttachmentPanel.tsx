import React from 'react';
import { AttachmentItem } from '../../types/visit';

interface Props {
  attachments: AttachmentItem[];
}

export default function AttachmentPanel({ attachments }: Props) {
  if (attachments.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Attachment Manifest</span>
        </div>
        <div className="panel-body">
          <div className="empty-state">
            <div className="empty-state-text">Add procedures to see attachment requirements</div>
          </div>
        </div>
      </div>
    );
  }

  const missing = attachments.filter(a => !a.present && a.required);
  const present = attachments.filter(a => a.present);
  const optional = attachments.filter(a => !a.present && !a.required);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Attachment Manifest</span>
        <span
          className={`panel-badge ${
            missing.length === 0 ? 'badge-success' : 'badge-warning'
          }`}
        >
          {missing.length === 0
            ? 'Complete'
            : `${missing.length} missing`}
        </span>
      </div>
      <div className="panel-body">
        {missing.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 6 }}>
              Required — Missing
            </div>
            {missing.map((a, i) => (
              <div key={i} className="attachment-item missing">
                <div>
                  <div style={{ fontWeight: 600 }}>{a.type}</div>
                  <div style={{ fontSize: 12, color: '#92400e' }}>{a.description}</div>
                </div>
                <span className="attachment-status" style={{ color: '#dc2626' }}>
                  MISSING
                </span>
              </div>
            ))}
          </div>
        )}

        {present.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 6 }}>
              Present
            </div>
            {present.map((a, i) => (
              <div key={i} className="attachment-item present">
                <div>
                  <div style={{ fontWeight: 600 }}>{a.type}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{a.description}</div>
                </div>
                <span className="attachment-status" style={{ color: '#059669' }}>
                  {'\u2713'}
                </span>
              </div>
            ))}
          </div>
        )}

        {optional.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6 }}>
              Recommended (Optional)
            </div>
            {optional.map((a, i) => (
              <div key={i} className="attachment-item">
                <div>
                  <div style={{ fontWeight: 600 }}>{a.type}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{a.description}</div>
                </div>
                <span className="attachment-status" style={{ color: '#9ca3af' }}>
                  —
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
