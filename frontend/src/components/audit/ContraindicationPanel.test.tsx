import React from 'react';
import { render, screen } from '@testing-library/react';
import ContraindicationPanel from './ContraindicationPanel';
import { detectContraindications } from '../../services/contraindicationEngine';
import { SAFETY_CASES } from '../../services/__fixtures__/clinicalSafetyCases';

describe('ContraindicationPanel', () => {
  it('renders nothing when there are no alerts', () => {
    const { container } = render(<ContraindicationPanel alerts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a critical alert with its recommendation and badge', () => {
    const syn003 = SAFETY_CASES.find(c => c.caseId === 'SYN-003')!; // penicillin allergy
    const alerts = detectContraindications(syn003.visit);
    render(<ContraindicationPanel alerts={alerts} />);

    expect(screen.getByText(/Clinical Safety Alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/1 CRITICAL/)).toBeInTheDocument();
    expect(screen.getByText(/Drug Allergy/)).toBeInTheDocument();
    expect(screen.getByText(/clindamycin or azithromycin/i)).toBeInTheDocument();
  });
});
