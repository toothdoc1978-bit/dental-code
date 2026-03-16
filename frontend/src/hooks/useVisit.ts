import { useState, useCallback } from 'react';
import { Visit, Procedure, Diagnosis, Radiograph, Anesthesia, Consent, Attestation } from '../types/visit';
import { createDefaultVisit } from '../utils/visitDefaults';
import { v4 as uuidv4 } from 'uuid';

export function useVisit() {
  const [visit, setVisit] = useState<Visit>(createDefaultVisit());

  const updateVisit = useCallback((updates: Partial<Visit>) => {
    setVisit(prev => ({ ...prev, ...updates }));
  }, []);

  const updatePatient = useCallback((updates: Partial<Visit['patient']>) => {
    setVisit(prev => ({ ...prev, patient: { ...prev.patient, ...updates } }));
  }, []);

  const updateVisitInfo = useCallback((updates: Partial<Visit['visitInfo']>) => {
    setVisit(prev => ({ ...prev, visitInfo: { ...prev.visitInfo, ...updates } }));
  }, []);

  const updateClinicalFindings = useCallback((updates: Partial<Visit['clinicalFindings']>) => {
    setVisit(prev => ({ ...prev, clinicalFindings: { ...prev.clinicalFindings, ...updates } }));
  }, []);

  const updateHealthHistory = useCallback((updates: Partial<Visit['healthHistory']>) => {
    setVisit(prev => ({ ...prev, healthHistory: { ...prev.healthHistory, ...updates } }));
  }, []);

  const updateOutcome = useCallback((updates: Partial<Visit['outcome']>) => {
    setVisit(prev => ({ ...prev, outcome: { ...prev.outcome, ...updates } }));
  }, []);

  // -- Procedures --
  const addProcedure = useCallback((proc: Omit<Procedure, 'id'>) => {
    setVisit(prev => ({
      ...prev,
      procedures: [...prev.procedures, { ...proc, id: uuidv4() }],
    }));
  }, []);

  const updateProcedure = useCallback((id: string, updates: Partial<Procedure>) => {
    setVisit(prev => ({
      ...prev,
      procedures: prev.procedures.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const removeProcedure = useCallback((id: string) => {
    setVisit(prev => ({
      ...prev,
      procedures: prev.procedures.filter(p => p.id !== id),
    }));
  }, []);

  // -- Diagnoses --
  const addDiagnosis = useCallback((diag: Omit<Diagnosis, 'id'>) => {
    setVisit(prev => ({
      ...prev,
      diagnoses: [...prev.diagnoses, { ...diag, id: uuidv4() }],
    }));
  }, []);

  const updateDiagnosis = useCallback((id: string, updates: Partial<Diagnosis>) => {
    setVisit(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.map(d => d.id === id ? { ...d, ...updates } : d),
    }));
  }, []);

  const removeDiagnosis = useCallback((id: string) => {
    setVisit(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.filter(d => d.id !== id),
    }));
  }, []);

  const setPrimaryDiagnosis = useCallback((id: string) => {
    setVisit(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.map(d => ({ ...d, isPrimary: d.id === id })),
    }));
  }, []);

  // -- Radiographs --
  const addRadiograph = useCallback((rad: Omit<Radiograph, 'id'>) => {
    setVisit(prev => ({
      ...prev,
      radiographs: [...prev.radiographs, { ...rad, id: uuidv4() }],
    }));
  }, []);

  const removeRadiograph = useCallback((id: string) => {
    setVisit(prev => ({
      ...prev,
      radiographs: prev.radiographs.filter(r => r.id !== id),
    }));
  }, []);

  // -- Anesthesia --
  const addAnesthesia = useCallback((anes: Anesthesia) => {
    setVisit(prev => ({
      ...prev,
      anesthesia: [...prev.anesthesia, anes],
    }));
  }, []);

  // -- Consent --
  const addConsent = useCallback((c: Consent) => {
    setVisit(prev => ({
      ...prev,
      consent: [...prev.consent, c],
    }));
  }, []);

  // -- Sedation --
  const updateSedation = useCallback((updates: Partial<Visit['sedation']>) => {
    setVisit(prev => ({
      ...prev,
      sedation: prev.sedation ? { ...prev.sedation, ...updates } as Visit['sedation'] : updates as Visit['sedation'],
    }));
  }, []);

  // -- Attestation --
  const attest = useCallback((provider: string, editsAfterAI: boolean) => {
    const attestation: Attestation = {
      provider,
      timestamp: new Date().toISOString(),
      editsAfterAI,
      locked: true,
    };
    setVisit(prev => ({ ...prev, attestation }));
  }, []);

  // -- Reset --
  const resetVisit = useCallback(() => {
    setVisit(createDefaultVisit());
  }, []);

  return {
    visit,
    updateVisit,
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
    addConsent,
    updateSedation,
    attest,
    resetVisit,
  };
}
