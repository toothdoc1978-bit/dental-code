import React from 'react';
import { ContraindicationAlert } from '../../types/visit';

interface Props {
  alerts: ContraindicationAlert[];
}

const SEVERITY_LABEL: Record<ContraindicationAlert['severity'], string> = {
  critical: 'Critical',
  warning: 'Caution',
  info: 'Note',
};

export default function ContraindicationPanel({ alerts }: Props) {
  if (alerts.length === 0) return null;

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const badgeClass = criticalCount > 0 ? 'badge-danger' : 'badge-warning';
  const badgeText =
    criticalCount > 0
      ? `${criticalCount} CRITICAL`
      : `${alerts.length} FLAG${alerts.length !== 1 ? 'S' : ''}`;

  return (
    <div className={`panel safety-panel ${criticalCount > 0 ? 'has-critical' : ''}`}>
      <div className="panel-header">
        <span className="panel-title">Clinical Safety Alerts</span>
        <span className={`panel-badge ${badgeClass}`}>{badgeText}</span>
      </div>
      <div className="panel-body">
        {alerts.map(alert => (
          <div key={alert.id} className={`safety-alert ${alert.severity}`}>
            <div className="safety-alert-head">
              <span className="safety-alert-sev">{SEVERITY_LABEL[alert.severity]}</span>
              <span className="safety-alert-title">{alert.category}</span>
            </div>
            <div className="safety-alert-detail">{alert.detail}</div>
            <div className="safety-alert-rec">
              <strong>Recommendation: </strong>
              {alert.recommendation}
            </div>
            {alert.triggers.length > 0 && (
              <div className="safety-alert-triggers">
                {alert.triggers.map((t, i) => (
                  <span key={i} className="safety-trigger">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
