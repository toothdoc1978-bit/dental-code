import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AttestationPanel from './AttestationPanel';
import type { ContraindicationAlert } from '../../types/visit';

const criticalAlert: ContraindicationAlert = {
  id: 'bleeding-anticoagulant',
  severity: 'critical',
  category: 'Bleeding Risk',
  title: 'Anticoagulant / bleeding risk',
  detail: 'INR supratherapeutic.',
  recommendation: 'Do not extract today.',
  triggers: ['Warfarin', 'INR 3.8'],
};

function renderPanel(criticalAlerts: ContraindicationAlert[]) {
  const onAttest = jest.fn();
  render(
    <AttestationPanel
      hasModifications={false}
      claimReadinessScore={100}
      criticalAlerts={criticalAlerts}
      onAttest={onAttest}
    />
  );
  return { onAttest };
}

describe('AttestationPanel — clinical safety gate', () => {
  it('requires only the accuracy confirmation when there are no critical alerts', () => {
    const { onAttest } = renderPanel([]);
    const button = screen.getByRole('button', { name: /attest & lock/i });

    expect(button).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/reviewed all AI-generated content/i));
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(onAttest).toHaveBeenCalledTimes(1);
  });

  it('blocks attestation on a critical alert until it is acknowledged', () => {
    const { onAttest } = renderPanel([criticalAlert]);
    const button = screen.getByRole('button', { name: /attest & lock/i });

    // The alert is surfaced at sign-off.
    expect(screen.getByText(/unresolved/i)).toBeInTheDocument();
    expect(screen.getByText(/Bleeding Risk:/)).toBeInTheDocument();

    // Accuracy alone is not enough.
    fireEvent.click(screen.getByLabelText(/reviewed all AI-generated content/i));
    expect(button).toBeDisabled();

    // Acknowledging the safety alert unblocks it.
    fireEvent.click(screen.getByLabelText(/addressed it clinically/i));
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(onAttest).toHaveBeenCalledTimes(1);
  });
});
