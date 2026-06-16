// =============================================================================
// Clinical Sidecar — Visit-Level Data Model
// Based on System Prompt Specification v2.0
// =============================================================================

// -- Patient ------------------------------------------------------------------
export interface Patient {
  name: string;
  dob: string;           // ISO date
  age: number;
  payer: PayerType;
  payerGroup: PayerGroup;
}

export type PayerType = 'MCNA' | 'Delta Dental' | 'Cigna' | 'Aetna' | 'MetLife' | 'Self-Pay' | 'Other';
export type PayerGroup = 'medicaid' | 'commercial' | 'self-pay';

// -- Visit Info ---------------------------------------------------------------
export interface VisitInfo {
  dos: string;            // date of service, ISO date
  provider: 'Dr. Chad Gardner' | 'Dr. Gardner';
  chiefComplaint: string;
  guardianPresent: boolean;
  guardianRelation?: string;
}

// -- Procedure ----------------------------------------------------------------
export interface Procedure {
  id: string;             // UUID
  cdt: string;            // e.g. "D2391"
  cdtDescription?: string;
  tooth?: number;
  surfaces: Surface[];
  icd10: string;          // primary diagnosis for this procedure
  icd10Alternatives?: string[];
  procFields: Record<string, unknown>;
  cptCrossCode?: string;
  cptCrossCodeDescription?: string;
}

export type Surface = 'M' | 'O' | 'D' | 'B' | 'L' | 'I' | 'F';

// -- Diagnosis ----------------------------------------------------------------
export interface Diagnosis {
  id: string;
  icd10: string;          // e.g. "K02.52"
  description: string;
  isPrimary: boolean;
  linkedProcedures: string[];   // procedure IDs
}

// -- Radiograph ---------------------------------------------------------------
export interface Radiograph {
  id: string;
  type: RadiographType;
  date: string;
  justification: string[];
  alaraChecks: string[];
}

export type RadiographType = 'PA' | 'BW' | 'Pano' | 'CBCT' | 'Occlusal' | 'Cephalometric';

// -- Clinical Findings --------------------------------------------------------
export interface ClinicalFindings {
  cariesRisk: 'low' | 'moderate' | 'high';
  cariesDepth?: 'enamel' | 'dentin' | 'pulp';
  perioStatus?: 'healthy' | 'gingivitis' | 'mild_periodontitis' | 'moderate_periodontitis' | 'severe_periodontitis';
  bop?: boolean;
  bopPercentage?: number;
  boneLoss?: boolean;
  boneLossDescription?: string;
  probingDepths?: Record<string, number[]>;   // tooth -> depths
  vitalityResults?: Record<string, VitalityResult>;
}

export interface VitalityResult {
  tooth: number;
  coldTest: 'positive' | 'negative' | 'lingering' | 'not_tested';
  ept: 'positive' | 'negative' | 'not_tested';
  percussion: 'positive' | 'negative' | 'not_tested';
  palpation: 'positive' | 'negative' | 'not_tested';
}

// -- Health History -----------------------------------------------------------
export interface HealthHistory {
  riskFlags: string[];
  activeConditions: string[];
  medications?: string[];          // current systemic medications
  allergies?: string[];            // drug/material allergies
  labs?: LabValues;                // relevant lab values
  pregnancyTrimester?: 1 | 2 | 3;  // set when patient is pregnant
}

export interface LabValues {
  inr?: number;     // International Normalized Ratio — anticoagulation status
  hba1c?: number;   // Glycated hemoglobin (percent) — glycemic control
}

// -- Consent ------------------------------------------------------------------
export interface Consent {
  procedure: string;
  status: 'obtained' | 'refused' | 'deferred';
  guardian?: string;
  reasoning?: string;
}

// -- Anesthesia ---------------------------------------------------------------
export interface Anesthesia {
  type: 'local' | 'topical' | 'block' | 'infiltration';
  site: string;
  agent: string;
  carpules: number;
}

// -- Sedation -----------------------------------------------------------------
export interface Sedation {
  type: 'nitrous' | 'oral_conscious' | 'iv_moderate' | 'general';
  asaClass: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV';
  monitoring: string[];
  timeIn: string;
  timeOut: string;
  vitals: Record<string, string>;
}

// -- Outcome ------------------------------------------------------------------
export interface Outcome {
  text: string;
  followup: string[];
  postOpMethod: 'verbal' | 'written' | 'both';
  postOpInstructions: string;
}

// -- Attestation --------------------------------------------------------------
export interface Attestation {
  provider: string;
  timestamp: string;      // ISO datetime
  editsAfterAI: boolean;
  locked: boolean;
}

// -- Complete Visit Object ----------------------------------------------------
export interface Visit {
  id: string;
  patient: Patient;
  visitInfo: VisitInfo;
  procedures: Procedure[];
  diagnoses: Diagnosis[];
  radiographs: Radiograph[];
  clinicalFindings: ClinicalFindings;
  healthHistory: HealthHistory;
  consent: Consent[];
  anesthesia: Anesthesia[];
  sedation?: Sedation;
  outcome: Outcome;
  attestation?: Attestation;
}

// -- Coding Suggestion --------------------------------------------------------
export interface CodingSuggestion {
  rank: number;
  code: string;
  codeType: 'CDT' | 'ICD10' | 'CPT';
  description: string;
  reasoning: string;
  isRecommended: boolean;
  auditRisk?: 'low' | 'medium' | 'high';
}

// -- Audit Risk ---------------------------------------------------------------
export interface AuditRisk {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

// -- Clinical Safety / Contraindications --------------------------------------
export type ContraindicationSeverity = 'critical' | 'warning' | 'info';

export interface ContraindicationAlert {
  id: string;                       // stable rule id, e.g. 'mronj-antiresorptive'
  severity: ContraindicationSeverity;
  category: string;                 // e.g. 'MRONJ Risk', 'Bleeding Risk'
  title: string;
  detail: string;                   // why this was flagged
  recommendation: string;           // safe alternative / required action
  triggers: string[];               // the specific inputs that triggered the rule
}

// -- Claim Readiness ----------------------------------------------------------
export interface ClaimReadiness {
  score: number;           // 0-100
  critical: CheckItem[];
  advisory: CheckItem[];
}

export interface CheckItem {
  label: string;
  passed: boolean;
  details?: string;
}

// -- SOAP Note ----------------------------------------------------------------
export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// -- Attachment Manifest ------------------------------------------------------
export interface AttachmentItem {
  type: string;
  required: boolean;
  present: boolean;
  description: string;
}

// -- Learning Record ----------------------------------------------------------
export interface ClaimRecord {
  payer: PayerType;
  dos: string;
  provider: string;
  procedures: { cdt: string; icd10: string[]; surfaces: Surface[]; tooth?: number }[];
  attachments: { type: string; present: boolean }[];
  narrativeHash: string;
  outcome: 'paid' | 'denied' | 'partial' | 'pending';
  denialReason?: string;
  appealOutcome?: string;
}

// -- Frequency Check ----------------------------------------------------------
export interface FrequencyCheck {
  procedure: string;
  cdtCode: string;
  lastServiceDate?: string;
  allowedInterval: string;
  withinWindow: boolean;
  medicalNecessityOverride?: string;
}

// -- Prior Authorization ------------------------------------------------------
export interface PriorAuth {
  required: boolean;
  procedureCode: string;
  status: 'not_required' | 'pending' | 'approved' | 'denied';
  authNumber?: string;
}
