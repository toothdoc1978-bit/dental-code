// =============================================================================
// Audit Risk Detection & Claim Readiness Engine
// Per Spec Sections 8 & 9
// =============================================================================

import { Visit, AuditRisk, ClaimReadiness, CheckItem, AttachmentItem, FrequencyCheck } from '../types/visit';

// -- Claim Readiness Scoring --------------------------------------------------

export function calculateClaimReadiness(visit: Visit): ClaimReadiness {
  const critical = getCriticalChecks(visit);
  const advisory = getAdvisoryChecks(visit);

  const totalChecks = critical.length + advisory.length;
  const passedCritical = critical.filter(c => c.passed).length;
  const passedAdvisory = advisory.filter(c => c.passed).length;

  // Critical checks weighted 2x
  const score = totalChecks > 0
    ? Math.round(((passedCritical * 2 + passedAdvisory) / (critical.length * 2 + advisory.length)) * 100)
    : 0;

  return { score, critical, advisory };
}

function getCriticalChecks(visit: Visit): CheckItem[] {
  const checks: CheckItem[] = [];

  // 1. Tooth number matches CDT code and narrative
  visit.procedures.forEach(proc => {
    const needsTooth = !isNonToothProcedure(proc.cdt);
    checks.push({
      label: `Tooth number documented for ${proc.cdt}`,
      passed: !needsTooth || (proc.tooth !== undefined && proc.tooth > 0),
      details: needsTooth && !proc.tooth ? `${proc.cdt} requires a tooth number` : undefined,
    });
  });

  // 2. Surfaces match CDT code
  visit.procedures.forEach(proc => {
    if (isSurfaceProcedure(proc.cdt)) {
      checks.push({
        label: `Surfaces documented for ${proc.cdt}`,
        passed: proc.surfaces.length > 0,
        details: proc.surfaces.length === 0 ? `${proc.cdt} requires surface designation` : undefined,
      });
    }
  });

  // 3. At least one ICD-10 diagnosis linked and primary
  const hasPrimary = visit.diagnoses.some(d => d.isPrimary);
  checks.push({
    label: 'Primary ICD-10 diagnosis designated',
    passed: hasPrimary,
    details: !hasPrimary ? 'Exactly one diagnosis must be marked as primary' : undefined,
  });

  // Z01.21 requires additional finding
  const hasZ0121 = visit.diagnoses.some(d => d.icd10 === 'Z01.21');
  if (hasZ0121) {
    const hasAdditionalDx = visit.diagnoses.some(d => d.icd10 !== 'Z01.21');
    checks.push({
      label: 'Z01.21 accompanied by specific finding diagnosis',
      passed: hasAdditionalDx,
      details: !hasAdditionalDx ? 'Z01.21 requires at least one additional ICD-10 describing the abnormal finding' : undefined,
    });
  }

  // 4. Radiographic support dated on/before DOS
  const dos = new Date(visit.visitInfo.dos);
  visit.radiographs.forEach(rad => {
    const radDate = new Date(rad.date);
    checks.push({
      label: `Radiograph ${rad.type} dated on/before DOS`,
      passed: radDate <= dos,
      details: radDate > dos ? 'Radiograph must be dated ON or BEFORE date of service' : undefined,
    });
  });

  // 5. ALARA justification for every radiograph
  visit.radiographs.forEach(rad => {
    checks.push({
      label: `ALARA justification for ${rad.type} radiograph`,
      passed: rad.alaraChecks.length > 0,
      details: rad.alaraChecks.length === 0 ? 'ALARA justification required for every radiograph billed' : undefined,
    });
  });

  // 6. No mutually exclusive codes same DOS
  const mutuallyExclusiveErrors = checkMutuallyExclusiveCodes(visit);
  mutuallyExclusiveErrors.forEach(err => {
    checks.push({
      label: err,
      passed: false,
    });
  });
  if (mutuallyExclusiveErrors.length === 0) {
    checks.push({
      label: 'No mutually exclusive code conflicts',
      passed: true,
    });
  }

  // 7. Each procedure has a diagnosis pointer
  visit.procedures.forEach(proc => {
    checks.push({
      label: `Diagnosis linked to ${proc.cdt}`,
      passed: !!proc.icd10 && proc.icd10.length > 0,
      details: !proc.icd10 ? 'Procedure has no diagnosis pointer — auto-deny trigger' : undefined,
    });
  });

  return checks;
}

function getAdvisoryChecks(visit: Visit): CheckItem[] {
  const checks: CheckItem[] = [];
  const isMCNA = visit.patient.payerGroup === 'medicaid';

  // 1. Caries risk documented (mandatory for MCNA/EPSDT)
  checks.push({
    label: 'Caries risk assessment documented',
    passed: !!visit.clinicalFindings.cariesRisk,
    details: isMCNA ? 'MANDATORY for MCNA/EPSDT encounters' : undefined,
  });

  // 2. Alternatives discussed
  const hasAlternatives = visit.consent.length > 0 || visit.outcome.text.toLowerCase().includes('alternative');
  checks.push({
    label: 'Alternatives discussed and documented',
    passed: hasAlternatives,
  });

  // 3. Consent documented
  checks.push({
    label: 'Consent documented',
    passed: visit.consent.length > 0,
  });

  // 4. Follow-up plan
  checks.push({
    label: 'Follow-up plan specified',
    passed: visit.outcome.followup.length > 0,
  });

  // 5. Guardian present for minor
  if (visit.patient.age < 18) {
    checks.push({
      label: 'Guardian present and documented (minor patient)',
      passed: visit.visitInfo.guardianPresent,
      details: isMCNA ? 'EPSDT requires guardian/parent documentation for minors' : undefined,
    });
  }

  return checks;
}

// -- Mutually Exclusive Code Pairs -------------------------------------------

const MUTUALLY_EXCLUSIVE_PAIRS: [string, string, string][] = [
  ['D4341', 'D1110', 'SRP and prophylaxis cannot be billed same DOS'],
  ['D4342', 'D1110', 'SRP and prophylaxis cannot be billed same DOS'],
  ['D4346', 'D1110', 'D4346 scaling and prophylaxis cannot be billed same DOS'],
  ['D4341', 'D4346', 'SRP and D4346 generalized scaling are mutually exclusive'],
];

function checkMutuallyExclusiveCodes(visit: Visit): string[] {
  const codes = new Set(visit.procedures.map(p => p.cdt));
  const errors: string[] = [];

  MUTUALLY_EXCLUSIVE_PAIRS.forEach(([a, b, msg]) => {
    if (codes.has(a) && codes.has(b)) {
      errors.push(msg);
    }
  });

  return errors;
}

// -- Encounter-Level Audit Risk Detection (Section 8.1) ----------------------

export function detectAuditRisks(visit: Visit): AuditRisk {
  const factors: string[] = [];
  const recommendations: string[] = [];

  // Multi-surface composites without photos (MCNA)
  const multiSurfaceComposites = visit.procedures.filter(
    p => ['D2392', 'D2393', 'D2394'].includes(p.cdt)
  );
  if (multiSurfaceComposites.length > 0 && visit.patient.payerGroup === 'medicaid') {
    factors.push(`${multiSurfaceComposites.length} multi-surface composite(s) — MCNA frequently audits these`);
    recommendations.push('Attach intraoral photos for each restorative site');
  }

  // High procedure count in single visit
  if (visit.procedures.length >= 4) {
    factors.push(`${visit.procedures.length} procedures in single visit may trigger review`);
    recommendations.push('Ensure documentation supports medical necessity for each procedure');
  }

  // Crown + composites same day
  const hasCrown = visit.procedures.some(p => p.cdt >= 'D2740' && p.cdt <= 'D2799');
  const hasComposite = visit.procedures.some(p => p.cdt >= 'D2140' && p.cdt <= 'D2394');
  if (hasCrown && hasComposite) {
    factors.push('Crown prep + composite restoration(s) in same visit');
    recommendations.push('Document clinical reasoning for same-day procedures');
  }

  // SRP without probing data
  const hasSRP = visit.procedures.some(p => ['D4341', 'D4342'].includes(p.cdt));
  if (hasSRP) {
    if (!visit.clinicalFindings.probingDepths || Object.keys(visit.clinicalFindings.probingDepths).length === 0) {
      factors.push('SRP billed without probing depths documented');
      recommendations.push('Document full-mouth probing chart before billing SRP');
    }
    if (!visit.clinicalFindings.boneLoss) {
      factors.push('SRP billed without radiographic bone loss evidence');
      recommendations.push('Attach radiographs showing bone loss to support SRP');
    }
  }

  // Endo without required radiographs
  const hasEndo = visit.procedures.some(p => p.cdt >= 'D3220' && p.cdt <= 'D3348');
  if (hasEndo) {
    const hasPAs = visit.radiographs.filter(r => r.type === 'PA').length;
    if (hasPAs < 2) {
      factors.push('Endodontic procedure with insufficient PA radiographs');
      recommendations.push('Pre-op PA, working length PA, and post-op PA required for endo billing');
    }
    if (!visit.clinicalFindings.vitalityResults || Object.keys(visit.clinicalFindings.vitalityResults).length === 0) {
      factors.push('Endodontic procedure without vitality testing documented');
      recommendations.push('Document vitality test results (cold, EPT, percussion, palpation)');
    }
  }

  // D4346 without confirming no bone loss
  const hasD4346 = visit.procedures.some(p => p.cdt === 'D4346');
  if (hasD4346 && visit.clinicalFindings.boneLoss) {
    factors.push('D4346 billed but bone loss documented — D4341/D4342 may be more appropriate');
    recommendations.push('D4346 requires bone_loss_present = false supported by radiographs');
  }

  // Sealant on restored tooth
  const hasSealant = visit.procedures.some(p => p.cdt === 'D1351');
  if (hasSealant) {
    recommendations.push('Verify sealant teeth are sound/non-cavitated. Sealant on cavitated/restored tooth = auto-deny');
  }

  // K02.9 usage when specificity available
  const hasUnspecifiedCaries = visit.diagnoses.some(d => d.icd10 === 'K02.9');
  if (hasUnspecifiedCaries && visit.clinicalFindings.cariesDepth) {
    factors.push('K02.9 (unspecified caries) used when depth information is documented');
    recommendations.push('Use specific caries code (K02.51/K02.52/K02.53) matching documented depth');
  }

  // Missing radiograph for restorative
  if (hasComposite && visit.radiographs.length === 0) {
    factors.push('Restorative procedure(s) with no radiographic evidence');
    recommendations.push('Attach pre-op BW showing caries extent');
  }

  const level: AuditRisk['level'] =
    factors.length === 0 ? 'low' :
    factors.length <= 2 ? 'medium' : 'high';

  return { level, factors, recommendations };
}

// -- Recommended Attachments (Section 7) --------------------------------------

export function getRecommendedAttachments(visit: Visit): AttachmentItem[] {
  const attachments: AttachmentItem[] = [];
  const isMCNA = visit.patient.payerGroup === 'medicaid';

  visit.procedures.forEach(proc => {
    const cdt = proc.cdt;

    // Composites
    if (cdt >= 'D2140' && cdt <= 'D2394') {
      attachments.push({
        type: 'Pre-op BW',
        required: true,
        present: visit.radiographs.some(r => r.type === 'BW'),
        description: `Pre-op BW showing caries extent for ${cdt}`,
      });
      if (isMCNA || cdt >= 'D2392') {
        attachments.push({
          type: 'Intraoral photo',
          required: isMCNA,
          present: false, // photos tracked externally
          description: `Intraoral photo for ${cdt}${isMCNA ? ' (MCNA strongly recommended — denial rate drops from 23% to 4% with photo)' : ''}`,
        });
      }
    }

    // Crowns
    if (cdt >= 'D2740' && cdt <= 'D2799') {
      attachments.push(
        { type: 'Pre-op radiograph', required: true, present: visit.radiographs.length > 0, description: 'Pre-op radiograph showing tooth condition' },
        { type: 'Pre-op intraoral photo', required: true, present: false, description: 'Photo showing >50% structure loss or fracture' },
        { type: 'Post-op radiograph', required: false, present: false, description: 'Post-op radiograph of seated crown' },
      );
    }

    // SRP
    if (cdt === 'D4341' || cdt === 'D4342') {
      attachments.push(
        { type: 'Full-mouth probing chart', required: true, present: !!visit.clinicalFindings.probingDepths, description: 'Probing depths documented' },
        { type: 'Radiograph showing bone loss', required: true, present: visit.radiographs.length > 0 && !!visit.clinicalFindings.boneLoss, description: 'BW or pano showing bone loss' },
        { type: 'BOP documentation', required: true, present: visit.clinicalFindings.bop !== undefined, description: 'Bleeding on probing documentation' },
      );
    }

    // Endodontic
    if (cdt >= 'D3220' && cdt <= 'D3348') {
      const paCount = visit.radiographs.filter(r => r.type === 'PA').length;
      attachments.push(
        { type: 'Pre-op PA', required: true, present: paCount >= 1, description: 'Pre-operative periapical radiograph' },
        { type: 'Working length PA', required: true, present: paCount >= 2, description: 'Working length determination radiograph' },
        { type: 'Post-op PA', required: true, present: paCount >= 3, description: 'Post-obturation periapical radiograph' },
        { type: 'Vitality test results', required: true, present: !!visit.clinicalFindings.vitalityResults, description: 'Cold test, EPT, percussion, palpation results' },
      );
    }

    // Surgical extraction
    if (cdt >= 'D7210' && cdt <= 'D7250') {
      attachments.push(
        { type: 'Pre-op PA', required: true, present: visit.radiographs.some(r => r.type === 'PA'), description: 'PA showing root morphology/pathology' },
      );
    }

    // SDF
    if (cdt === 'D1354') {
      attachments.push(
        { type: 'Intraoral photo', required: true, present: false, description: 'Photo of treated teeth before SDF application' },
        { type: 'Consent for staining', required: true, present: visit.consent.some(c => c.procedure === 'D1354'), description: 'Informed consent documenting staining acceptance' },
      );
    }

    // Sealant
    if (cdt === 'D1351') {
      attachments.push(
        { type: 'BW confirming sound tooth', required: true, present: visit.radiographs.some(r => r.type === 'BW'), description: 'BW confirming sound/non-cavitated tooth' },
      );
      if (isMCNA) {
        attachments.push(
          { type: 'Intraoral photo', required: true, present: false, description: 'Intraoral photo for MCNA sealant claim' },
        );
      }
    }
  });

  return attachments;
}

// -- Helpers ------------------------------------------------------------------

function isNonToothProcedure(cdt: string): boolean {
  const nonToothCodes = ['D0210', 'D0220', 'D0230', 'D0270', 'D0272', 'D0274', 'D0330',
    'D1110', 'D1120', 'D1206', 'D1208', 'D9230', 'D9241', 'D9242', 'D9243',
    'D0120', 'D0140', 'D0150', 'D0160', 'D0170', 'D0180'];
  return nonToothCodes.includes(cdt);
}

function isSurfaceProcedure(cdt: string): boolean {
  // Composites and amalgams require surface designation
  return (cdt >= 'D2140' && cdt <= 'D2161') || (cdt >= 'D2330' && cdt <= 'D2394');
}
