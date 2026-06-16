import React, { useState, useMemo } from 'react';
import { useVisit } from '../hooks/useVisit';
import { SOAPNote } from '../types/visit';
import { generateSOAPNote } from '../services/soapGenerator';
import { calculateClaimReadiness, detectAuditRisks, getRecommendedAttachments } from '../services/auditEngine';
import { detectContraindications } from '../services/contraindicationEngine';

// Visit input panels
import PatientPanel from '../components/visit/PatientPanel';
import VisitInfoPanel from '../components/visit/VisitInfoPanel';
import ClinicalFindingsPanel from '../components/visit/ClinicalFindingsPanel';
import HealthHistoryPanel from '../components/visit/HealthHistoryPanel';
import RadiographPanel from '../components/visit/RadiographPanel';
import AnesthesiaPanel from '../components/visit/AnesthesiaPanel';
import OutcomePanel from '../components/visit/OutcomePanel';

// Coding panels
import ProcedureEntryPanel from '../components/coding/ProcedureEntryPanel';
import DiagnosisPanel from '../components/coding/DiagnosisPanel';
import CodingSuggestionPanel from '../components/coding/CodingSuggestionPanel';

// Output panels
import SOAPNotePanel from '../components/soap/SOAPNotePanel';
import AuditRiskPanel from '../components/audit/AuditRiskPanel';
import ContraindicationPanel from '../components/audit/ContraindicationPanel';
import ClaimReadinessPanel from '../components/audit/ClaimReadinessPanel';
import AttachmentPanel from '../components/audit/AttachmentPanel';
import AttestationPanel from '../components/attestation/AttestationPanel';

type WorkflowStep = 'patient' | 'clinical' | 'procedures' | 'review';

const WORKFLOW_STEPS: { key: WorkflowStep; label: string; number: number }[] = [
  { key: 'patient', label: 'Patient & Visit', number: 1 },
  { key: 'clinical', label: 'Clinical Data', number: 2 },
  { key: 'procedures', label: 'Procedures & Coding', number: 3 },
  { key: 'review', label: 'Review & Attest', number: 4 },
];

export default function VisitWorkspace() {
  const {
    visit,
    updatePatient,
    updateVisitInfo,
    updateClinicalFindings,
    updateHealthHistory,
    updateOutcome,
    addProcedure,
    updateProcedure,
    removeProcedure,
    addDiagnosis,
    updateDiagnosis,
    removeDiagnosis,
    setPrimaryDiagnosis,
    addRadiograph,
    removeRadiograph,
    addAnesthesia,
    attest,
    resetVisit,
  } = useVisit();

  const [activeStep, setActiveStep] = useState<WorkflowStep>('patient');
  const [soapEdits, setSoapEdits] = useState<Partial<SOAPNote>>({});
  const [hasModifications, setHasModifications] = useState(false);

  // Compute derived state
  const generatedSOAP = useMemo(() => generateSOAPNote(visit), [visit]);
  const soapNote: SOAPNote = useMemo(
    () => ({
      subjective: soapEdits.subjective ?? generatedSOAP.subjective,
      objective: soapEdits.objective ?? generatedSOAP.objective,
      assessment: soapEdits.assessment ?? generatedSOAP.assessment,
      plan: soapEdits.plan ?? generatedSOAP.plan,
    }),
    [generatedSOAP, soapEdits]
  );

  const auditRisk = useMemo(() => detectAuditRisks(visit), [visit]);
  const contraindications = useMemo(() => detectContraindications(visit), [visit]);
  const claimReadiness = useMemo(() => calculateClaimReadiness(visit), [visit]);
  const attachments = useMemo(() => getRecommendedAttachments(visit), [visit]);

  const isLocked = visit.attestation?.locked === true;

  const handleSoapEdit = (section: keyof SOAPNote, value: string) => {
    setSoapEdits(prev => ({ ...prev, [section]: value }));
    setHasModifications(true);
  };

  const getStepStatus = (step: WorkflowStep): 'active' | 'completed' | '' => {
    if (step === activeStep) return 'active';
    // Simple completion heuristic
    switch (step) {
      case 'patient':
        return visit.patient.name && visit.visitInfo.dos ? 'completed' : '';
      case 'clinical':
        return visit.clinicalFindings.cariesRisk ? 'completed' : '';
      case 'procedures':
        return visit.procedures.length > 0 && visit.diagnoses.length > 0 ? 'completed' : '';
      case 'review':
        return visit.attestation?.locked ? 'completed' : '';
      default:
        return '';
    }
  };

  return (
    <div>
      {/* Workflow navigation */}
      <div className="workspace-nav">
        {WORKFLOW_STEPS.map(step => (
          <button
            key={step.key}
            className={`nav-step ${getStepStatus(step.key)}`}
            onClick={() => setActiveStep(step.key)}
          >
            <span className="nav-step-number">{step.number}</span>
            {step.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-outline btn-sm" onClick={resetVisit}>
          New Visit
        </button>
      </div>

      <div className="workspace">
        {/* LEFT COLUMN — Input panels */}
        <div className="workspace-left">
          {activeStep === 'patient' && (
            <>
              <PatientPanel
                patient={visit.patient}
                onChange={updatePatient}
              />
              <VisitInfoPanel
                visitInfo={visit.visitInfo}
                patientAge={visit.patient.age}
                onChange={updateVisitInfo}
              />
              <HealthHistoryPanel
                history={visit.healthHistory}
                onChange={updateHealthHistory}
              />
            </>
          )}

          {activeStep === 'clinical' && (
            <>
              <ClinicalFindingsPanel
                findings={visit.clinicalFindings}
                onChange={updateClinicalFindings}
              />
              <RadiographPanel
                radiographs={visit.radiographs}
                onAdd={addRadiograph}
                onRemove={removeRadiograph}
              />
              <AnesthesiaPanel
                anesthesia={visit.anesthesia}
                onAdd={addAnesthesia}
              />
            </>
          )}

          {activeStep === 'procedures' && (
            <>
              <ProcedureEntryPanel
                procedures={visit.procedures}
                onAdd={addProcedure}
                onUpdate={updateProcedure}
                onRemove={removeProcedure}
              />
              <DiagnosisPanel
                diagnoses={visit.diagnoses}
                procedures={visit.procedures}
                cariesDepth={visit.clinicalFindings.cariesDepth}
                onAdd={addDiagnosis}
                onUpdate={updateDiagnosis}
                onRemove={removeDiagnosis}
                onSetPrimary={setPrimaryDiagnosis}
              />
              <CodingSuggestionPanel
                procedures={visit.procedures}
                diagnoses={visit.diagnoses}
                clinicalFindings={visit.clinicalFindings}
                payerGroup={visit.patient.payerGroup}
              />
            </>
          )}

          {activeStep === 'review' && (
            <>
              <SOAPNotePanel
                note={soapNote}
                onEdit={handleSoapEdit}
                locked={isLocked}
              />
              <OutcomePanel
                outcome={visit.outcome}
                onChange={updateOutcome}
              />
            </>
          )}
        </div>

        {/* RIGHT COLUMN — Intelligence panels (always visible) */}
        <div className="workspace-right">
          {/* Clinical Safety — surface medical contraindications first */}
          <ContraindicationPanel alerts={contraindications} />

          {/* Claim Readiness — always show */}
          <ClaimReadinessPanel readiness={claimReadiness} />

          {/* Audit Risk — show when procedures exist */}
          {visit.procedures.length > 0 && (
            <AuditRiskPanel risk={auditRisk} />
          )}

          {/* Attachments — show when procedures exist */}
          {visit.procedures.length > 0 && (
            <AttachmentPanel attachments={attachments} />
          )}

          {/* SOAP Preview — show in non-review steps */}
          {activeStep !== 'review' && (soapNote.subjective || soapNote.objective) && (
            <SOAPNotePanel
              note={soapNote}
              onEdit={handleSoapEdit}
              locked={isLocked}
            />
          )}

          {/* Attestation — show in review step */}
          {activeStep === 'review' && (
            <AttestationPanel
              attestation={visit.attestation}
              hasModifications={hasModifications}
              claimReadinessScore={claimReadiness.score}
              criticalAlerts={contraindications.filter(a => a.severity === 'critical')}
              onAttest={attest}
            />
          )}
        </div>
      </div>
    </div>
  );
}
