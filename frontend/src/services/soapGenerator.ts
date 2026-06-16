// =============================================================================
// SOAP Note Generator — Structured Data → SOAP Narrative
// Per Spec Section 12: Structured data first, narratives second
// =============================================================================

import { Visit, Procedure, Diagnosis, SOAPNote } from '../types/visit';
import { format } from 'date-fns';

export function generateSOAPNote(visit: Visit): SOAPNote {
  return {
    subjective: generateSubjective(visit),
    objective: generateObjective(visit),
    assessment: generateAssessment(visit),
    plan: generatePlan(visit),
  };
}

// -- Subjective ---------------------------------------------------------------
function generateSubjective(visit: Visit): string {
  const parts: string[] = [];

  if (visit.visitInfo.chiefComplaint) {
    parts.push(`Chief complaint: "${visit.visitInfo.chiefComplaint}"`);
  }

  if (visit.patient.age < 18 && visit.visitInfo.guardianPresent) {
    parts.push(
      `Guardian (${visit.visitInfo.guardianRelation || 'parent'}) present and providing history.`
    );
  }

  if (visit.healthHistory.activeConditions.length > 0) {
    parts.push(
      `Relevant medical history: ${visit.healthHistory.activeConditions.join(', ')}.`
    );
  }

  const medications = visit.healthHistory.medications ?? [];
  if (medications.length > 0) {
    parts.push(`Current medications: ${medications.join(', ')}.`);
  }

  const allergies = visit.healthHistory.allergies ?? [];
  if (allergies.length > 0) {
    parts.push(`Allergies: ${allergies.join(', ')}.`);
  }

  if (visit.healthHistory.riskFlags.length > 0) {
    parts.push(`Risk flags: ${visit.healthHistory.riskFlags.join(', ')}.`);
  }

  return parts.join(' ') || 'No subjective findings reported.';
}

// -- Objective ----------------------------------------------------------------
function generateObjective(visit: Visit): string {
  const parts: string[] = [];
  const cf = visit.clinicalFindings;

  // Caries risk (mandatory for MCNA)
  parts.push(`Caries risk assessment: ${cf.cariesRisk}.`);

  // Clinical findings per procedure
  visit.procedures.forEach(proc => {
    const toothStr = proc.tooth ? `Tooth #${proc.tooth}` : '';
    const surfStr = proc.surfaces.length > 0 ? ` ${proc.surfaces.join('')}` : '';

    if (cf.cariesDepth) {
      parts.push(
        `${toothStr}${surfStr}: ${describeCariesDepth(cf.cariesDepth)} confirmed clinically${getRadiographicSupport(visit, proc)}.`
      );
    } else if (toothStr) {
      parts.push(`${toothStr}${surfStr} examined.`);
    }
  });

  // Periodontal findings
  if (cf.perioStatus && cf.perioStatus !== 'healthy') {
    let perioDesc = `Periodontal status: ${cf.perioStatus.replace(/_/g, ' ')}.`;
    if (cf.bop !== undefined) {
      perioDesc += ` BOP: ${cf.bop ? 'positive' : 'negative'}${cf.bopPercentage ? ` (${cf.bopPercentage}%)` : ''}.`;
    }
    if (cf.boneLoss) {
      perioDesc += ` Radiographic bone loss: ${cf.boneLossDescription || 'present'}.`;
    }
    parts.push(perioDesc);
  }

  // Vitality results
  if (cf.vitalityResults) {
    Object.values(cf.vitalityResults).forEach(vr => {
      const results: string[] = [];
      if (vr.coldTest !== 'not_tested') results.push(`cold ${vr.coldTest}`);
      if (vr.ept !== 'not_tested') results.push(`EPT ${vr.ept}`);
      if (vr.percussion !== 'not_tested') results.push(`percussion ${vr.percussion}`);
      if (vr.palpation !== 'not_tested') results.push(`palpation ${vr.palpation}`);
      if (results.length > 0) {
        parts.push(`Tooth #${vr.tooth} vitality testing: ${results.join(', ')}.`);
      }
    });
  }

  // Radiographs
  visit.radiographs.forEach(rad => {
    const dateStr = rad.date ? format(new Date(rad.date), 'MM/dd/yyyy') : 'undated';
    parts.push(`${rad.type} radiograph (${dateStr}): ${rad.justification.join('; ')}.`);
    if (rad.alaraChecks.length > 0) {
      parts.push(`ALARA: ${rad.alaraChecks.join('; ')}.`);
    }
  });

  return parts.join(' ') || 'No objective findings documented.';
}

// -- Assessment ---------------------------------------------------------------
function generateAssessment(visit: Visit): string {
  const parts: string[] = [];

  const primary = visit.diagnoses.find(d => d.isPrimary);
  const secondary = visit.diagnoses.filter(d => !d.isPrimary);

  if (primary) {
    parts.push(`Primary diagnosis: ${primary.icd10} — ${primary.description}.`);
  }

  secondary.forEach(d => {
    parts.push(`${d.icd10} — ${d.description}.`);
  });

  // Medical necessity statement
  if (visit.procedures.length > 0 && primary) {
    parts.push(generateMedicalNecessityStatement(visit, primary));
  }

  return parts.join(' ') || 'No assessment documented.';
}

// -- Plan ---------------------------------------------------------------------
function generatePlan(visit: Visit): string {
  const parts: string[] = [];

  // Treatment rendered
  visit.procedures.forEach(proc => {
    parts.push(generateProcedureNarrative(visit, proc));
  });

  // Anesthesia
  visit.anesthesia.forEach(a => {
    parts.push(
      `${a.type.charAt(0).toUpperCase() + a.type.slice(1)} anesthesia: ${a.agent}, ${a.carpules} carpule(s) administered at ${a.site}.`
    );
  });

  // Sedation
  if (visit.sedation) {
    const s = visit.sedation;
    parts.push(
      `${s.type.replace(/_/g, ' ')} sedation administered. ASA Class: ${s.asaClass}. Time in: ${s.timeIn}, Time out: ${s.timeOut}. Monitoring: ${s.monitoring.join(', ')}.`
    );
  }

  // Outcome
  if (visit.outcome.text) {
    parts.push(visit.outcome.text);
  }

  // Post-op
  if (visit.outcome.postOpInstructions) {
    parts.push(
      `Post-operative instructions given (${visit.outcome.postOpMethod}): ${visit.outcome.postOpInstructions}`
    );
  }

  // Follow-up
  if (visit.outcome.followup.length > 0) {
    parts.push(`Follow-up: ${visit.outcome.followup.join('; ')}.`);
  }

  return parts.join(' ') || 'No plan documented.';
}

// -- Helpers ------------------------------------------------------------------

function describeCariesDepth(depth: string): string {
  switch (depth) {
    case 'enamel': return 'carious lesion limited to enamel';
    case 'dentin': return 'carious lesion extending into dentin';
    case 'pulp': return 'carious lesion with pulpal involvement';
    default: return 'carious lesion';
  }
}

function getRadiographicSupport(visit: Visit, proc: Procedure): string {
  const matchingRad = visit.radiographs.find(r => {
    const dosDate = new Date(visit.visitInfo.dos);
    const radDate = new Date(r.date);
    return radDate <= dosDate;
  });

  if (matchingRad) {
    const dateStr = format(new Date(matchingRad.date), 'MM/dd/yyyy');
    return ` and radiographically (${matchingRad.type} ${dateStr})`;
  }
  return '';
}

function generateMedicalNecessityStatement(visit: Visit, primary: Diagnosis): string {
  const cf = visit.clinicalFindings;
  const parts: string[] = ['Treatment is medically necessary'];

  if (cf.cariesDepth === 'dentin' || cf.cariesDepth === 'pulp') {
    parts.push(`due to ${describeCariesDepth(cf.cariesDepth)} confirmed clinically and radiographically`);
  } else if (cf.perioStatus && cf.perioStatus !== 'healthy') {
    parts.push(`due to ${cf.perioStatus.replace(/_/g, ' ')}`);
    if (cf.boneLoss) parts.push('with radiographic evidence of bone loss');
  }

  parts.push(`supporting diagnosis of ${primary.icd10}`);
  return parts.join(' ') + '.';
}

function generateProcedureNarrative(visit: Visit, proc: Procedure): string {
  const toothStr = proc.tooth ? `Tooth #${proc.tooth}` : '';
  const surfStr = proc.surfaces.length > 0 ? ` ${proc.surfaces.join('')}` : '';
  const cdt = proc.cdt;

  // Composite restoration
  if (cdt >= 'D2140' && cdt <= 'D2394') {
    const radSupport = getRadiographicSupport(visit, proc);
    return `${toothStr}${surfStr} composite placed for ${describeCariesFinding(visit)}${radSupport}. Caries excavated, selective etch, bonding agent applied, composite placed and light-cured in increments. Contacts verified, occlusion adjusted. Pt tolerated well.`;
  }

  // Crown
  if (cdt >= 'D2740' && cdt <= 'D2799') {
    return `${toothStr} crown preparation completed. Impressions taken, shade selected, temporary crown placed with temporary cement. Pt tolerated procedure well.`;
  }

  // SRP
  if (cdt === 'D4341' || cdt === 'D4342') {
    return `Scaling and root planing performed${toothStr ? ` in the area of ${toothStr}` : ''}. Subgingival calculus and biofilm removed with ultrasonic and hand instrumentation. Pt tolerated well.`;
  }

  // Extraction
  if (cdt >= 'D7140' && cdt <= 'D7250') {
    const type = cdt === 'D7140' ? 'simple' : 'surgical';
    return `${toothStr} ${type} extraction performed. Tooth delivered intact. Socket inspected, hemostasis achieved. Post-operative instructions given.`;
  }

  // Endo
  if (cdt >= 'D3220' && cdt <= 'D3348') {
    return `${toothStr} endodontic therapy initiated/completed. Pulp extirpated, canals instrumented, irrigated with NaOCl, and obturated with gutta-percha and sealer. Post-operative radiograph confirms adequate fill.`;
  }

  // Radiograph
  if (cdt >= 'D0210' && cdt <= 'D0330') {
    return `Radiograph(s) exposed and reviewed.`;
  }

  // Prophy
  if (cdt === 'D1110' || cdt === 'D1120') {
    return `Prophylaxis performed. Calculus and plaque removed. OHI provided.`;
  }

  // Sealant
  if (cdt === 'D1351') {
    return `${toothStr} sealant applied. Tooth isolated, etched, sealant placed and light-cured. Retention verified.`;
  }

  // SDF
  if (cdt === 'D1354') {
    return `${toothStr} silver diamine fluoride applied. Informed consent obtained including discussion of staining.`;
  }

  // Fluoride
  if (cdt === 'D1206' || cdt === 'D1208') {
    return `Fluoride varnish applied to all teeth.`;
  }

  // Nitrous
  if (cdt === 'D9230') {
    return `Nitrous oxide/oxygen analgesia administered and monitored throughout procedure.`;
  }

  // Default
  return `${proc.cdtDescription || cdt} performed${toothStr ? ` on ${toothStr}` : ''}. Pt tolerated well.`;
}

function describeCariesFinding(visit: Visit): string {
  const cf = visit.clinicalFindings;
  if (cf.cariesDepth) {
    return describeCariesDepth(cf.cariesDepth);
  }
  return 'carious lesion';
}
