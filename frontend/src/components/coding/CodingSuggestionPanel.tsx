import React, { useMemo } from 'react';
import {
  Procedure,
  Diagnosis,
  ClinicalFindings,
  PayerGroup,
  CodingSuggestion,
} from '../../types/visit';
import { CDT_CODE_MAP } from '../../data/cdtCodes';
import { ICD10_CODE_MAP } from '../../data/icd10Codes';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface CodingSuggestionPanelProps {
  procedures: Procedure[];
  diagnoses: Diagnosis[];
  clinicalFindings: ClinicalFindings;
  payerGroup: PayerGroup;
}

// -----------------------------------------------------------------------------
// CPT cross-code mappings for dental procedures (Section 5.3)
// -----------------------------------------------------------------------------

const CPT_CROSS_CODES: Record<string, { cpt: string; description: string; condition: string }[]> = {
  D3310: [
    { cpt: '41899', description: 'Unlisted procedure, dentoalveolar structures', condition: 'Medical necessity for endo on anterior tooth' },
  ],
  D3320: [
    { cpt: '41899', description: 'Unlisted procedure, dentoalveolar structures', condition: 'Medical necessity for endo on premolar' },
  ],
  D3330: [
    { cpt: '41899', description: 'Unlisted procedure, dentoalveolar structures', condition: 'Medical necessity for endo on molar' },
  ],
  D7140: [
    { cpt: '41899', description: 'Unlisted procedure, dentoalveolar structures', condition: 'Extraction with medical indication' },
  ],
  D7210: [
    { cpt: '41899', description: 'Unlisted procedure, dentoalveolar structures', condition: 'Surgical extraction — medical plan coverage' },
  ],
  D7220: [
    { cpt: '23020', description: 'Removal of impacted soft tissue', condition: 'Impacted tooth removal — medical necessity' },
  ],
  D7230: [
    { cpt: '23020', description: 'Removal of impacted partially bony', condition: 'Partially bony impaction — medical necessity' },
  ],
  D7240: [
    { cpt: '23020', description: 'Removal of impacted completely bony', condition: 'Completely bony impaction — medical necessity' },
  ],
  D7241: [
    { cpt: '23020', description: 'Removal of impacted completely bony with complications', condition: 'Complex impaction — medical necessity' },
  ],
  D9230: [
    { cpt: '99151', description: 'Moderate sedation, same physician, initial 15 min, age <5', condition: 'Sedation with medical justification' },
    { cpt: '99152', description: 'Moderate sedation, same physician, initial 15 min, age 5+', condition: 'Sedation with medical justification' },
  ],
  D9239: [
    { cpt: '99151', description: 'Moderate sedation, same physician, initial 15 min, age <5', condition: 'IV sedation with medical justification' },
    { cpt: '99152', description: 'Moderate sedation, same physician, initial 15 min, age 5+', condition: 'IV sedation with medical justification' },
  ],
};

// -----------------------------------------------------------------------------
// Suggestion generation (Sections 5.1 – 5.4)
// -----------------------------------------------------------------------------

function generateSuggestions(
  procedures: Procedure[],
  diagnoses: Diagnosis[],
  clinicalFindings: ClinicalFindings,
  payerGroup: PayerGroup,
): CodingSuggestion[] {
  const suggestions: CodingSuggestion[] = [];
  let rank = 1;

  // ---- Section 5.1: CDT code suggestions based on clinical findings --------

  for (const proc of procedures) {
    const cdtInfo = CDT_CODE_MAP[proc.cdt];

    // Caries depth + composite procedure suggestions
    if (clinicalFindings.cariesDepth === 'dentin' && proc.cdt === 'D2391') {
      suggestions.push({
        rank: rank++,
        code: 'K02.52',
        codeType: 'ICD10',
        description: 'Dental caries on pit and fissure surface penetrating into dentin',
        reasoning:
          'Caries depth is documented as "dentin" and procedure is D2391 (posterior composite, 1 surface). K02.52 is the most specific diagnosis code for dentin-depth pit/fissure caries.',
        isRecommended: true,
        auditRisk: 'low',
      });
    }

    if (clinicalFindings.cariesDepth === 'enamel' && proc.cdt === 'D2391') {
      suggestions.push({
        rank: rank++,
        code: 'D1352',
        codeType: 'CDT',
        description: 'Preventive resin restoration in a moderate to high caries risk patient',
        reasoning:
          'Caries depth is "enamel" — consider D1352 (preventive resin restoration) as an alternative to D2391 for enamel-limited lesions, especially in moderate-to-high caries risk patients. D1352 may have different reimbursement and documentation requirements.',
        isRecommended: false,
        auditRisk: 'medium',
      });

      suggestions.push({
        rank: rank++,
        code: 'K02.51',
        codeType: 'ICD10',
        description: 'Dental caries on pit and fissure surface limited to enamel',
        reasoning:
          'Caries depth is documented as "enamel." K02.51 provides the highest specificity for enamel-limited pit/fissure caries and is preferred over K02.9.',
        isRecommended: true,
        auditRisk: 'low',
      });
    }

    if (clinicalFindings.cariesDepth === 'pulp' && proc.cdt === 'D2391') {
      suggestions.push({
        rank: rank++,
        code: 'K02.53',
        codeType: 'ICD10',
        description: 'Dental caries on pit and fissure surface penetrating into pulp',
        reasoning:
          'Caries depth is "pulp" — K02.53 is indicated. Also consider whether endodontic treatment (D3310/D3320/D3330) is needed rather than a direct restoration.',
        isRecommended: true,
        auditRisk: 'medium',
      });
    }

    // ---- Section 5.2: Procedure-to-diagnosis mapping suggestions ----------

    if (proc.icd10) {
      const icd10Info = ICD10_CODE_MAP[proc.icd10];
      if (icd10Info && !icd10Info.commonProcedures.includes(proc.cdt)) {
        suggestions.push({
          rank: rank++,
          code: proc.icd10,
          codeType: 'ICD10',
          description: `${icd10Info.description} — atypical pairing`,
          reasoning: `Diagnosis ${proc.icd10} is not commonly mapped to procedure ${proc.cdt}. Verify the procedure-diagnosis pairing is accurate and clinically supported. Atypical pairings may trigger audit review.`,
          isRecommended: false,
          auditRisk: 'medium',
        });
      }
    }
  }

  // ---- SRP without bone loss documented (Section 5.4 audit concern) ------

  const srpCodes = ['D4341', 'D4342'];
  const hasSRP = procedures.some((p) => srpCodes.includes(p.cdt));
  if (hasSRP && !clinicalFindings.boneLoss) {
    suggestions.push({
      rank: rank++,
      code: 'D4341',
      codeType: 'CDT',
      description: 'SRP present without documented bone loss',
      reasoning:
        'Scaling and root planing (D4341/D4342) is coded but radiographic bone loss is not documented. Most payers require evidence of bone loss for SRP reimbursement. Document bone loss findings or consider D4346 (generalized moderate/severe gingival inflammation) or D1110 (prophylaxis) if bone loss is absent.',
      isRecommended: false,
      auditRisk: 'high',
    });
  }

  // ---- Endo procedures: suggest CPT cross-codes (Section 5.3) ------------

  const endoCodes = ['D3310', 'D3320', 'D3330', 'D3346', 'D3347', 'D3348'];
  const hasEndo = procedures.some((p) => endoCodes.includes(p.cdt));
  if (hasEndo && payerGroup === 'commercial') {
    suggestions.push({
      rank: rank++,
      code: '41899',
      codeType: 'CPT',
      description: 'Unlisted procedure, dentoalveolar structures',
      reasoning:
        'Endodontic therapy is present. For commercial payers with medical plan dental coverage, cross-billing to CPT may provide additional or primary reimbursement. Verify patient benefits before submitting.',
      isRecommended: false,
      auditRisk: 'low',
    });
  }

  // ---- Section 5.3: CPT cross-billing opportunities ----------------------

  for (const proc of procedures) {
    const crossCodes = CPT_CROSS_CODES[proc.cdt];
    if (crossCodes && payerGroup !== 'self-pay') {
      for (const cc of crossCodes) {
        // Avoid duplicating the endo CPT suggestion already added above
        if (endoCodes.includes(proc.cdt) && cc.cpt === '41899' && payerGroup === 'commercial') {
          continue;
        }
        suggestions.push({
          rank: rank++,
          code: cc.cpt,
          codeType: 'CPT',
          description: cc.description,
          reasoning: `Procedure ${proc.cdt} may qualify for CPT cross-billing (${cc.cpt}). Condition: ${cc.condition}. Check patient's medical benefit coverage before submitting.`,
          isRecommended: false,
          auditRisk: 'low',
        });
      }
    }
  }

  // ---- Section 5.4: Audit-sensitive procedure warnings -------------------

  for (const proc of procedures) {
    const cdtInfo = CDT_CODE_MAP[proc.cdt];
    if (cdtInfo && cdtInfo.auditSensitive) {
      const missingDocs = cdtInfo.requiredDocumentation.filter((doc) => {
        // Basic check: if proc has tooth but 'tooth_number' is required, it's present
        if (doc === 'tooth_number' && proc.tooth != null) return false;
        if (doc === 'surface' && proc.surfaces.length > 0) return false;
        if (doc === 'surfaces' && proc.surfaces.length > 0) return false;
        if (doc === 'diagnosis' && proc.icd10) return false;
        // All others we flag as potentially missing
        return true;
      });

      if (missingDocs.length > 0) {
        suggestions.push({
          rank: rank++,
          code: proc.cdt,
          codeType: 'CDT',
          description: `${cdtInfo.description} — audit documentation reminder`,
          reasoning: `${proc.cdt} is audit-sensitive. The following documentation elements should be confirmed: ${missingDocs.map((d) => d.replace(/_/g, ' ')).join(', ')}. Missing documentation increases denial and audit risk.`,
          isRecommended: false,
          auditRisk: 'high',
        });
      }
    }
  }

  // ---- K02.9 specificity warning (supports DiagnosisPanel warning) -------

  const hasK029 = diagnoses.some((d) => d.icd10 === 'K02.9');
  if (hasK029 && clinicalFindings.cariesDepth) {
    const depthMap: Record<string, string> = {
      enamel: 'K02.51 or K02.61',
      dentin: 'K02.52 or K02.62',
      pulp: 'K02.53 or K02.63',
    };
    const specific = depthMap[clinicalFindings.cariesDepth];
    if (specific) {
      suggestions.push({
        rank: rank++,
        code: 'K02.9',
        codeType: 'ICD10',
        description: 'Dental caries, unspecified — specificity available',
        reasoning: `K02.9 is used but caries depth "${clinicalFindings.cariesDepth}" is documented. Use ${specific} for greatest specificity. Unspecified codes increase audit scrutiny, especially for Medicaid payers.`,
        isRecommended: false,
        auditRisk: payerGroup === 'medicaid' ? 'high' : 'medium',
      });
    }
  }

  // ---- Z01.21 without finding code warning --------------------------------

  const hasZ0121 = diagnoses.some((d) => d.icd10 === 'Z01.21');
  if (hasZ0121) {
    const hasFindingCode = diagnoses.some(
      (d) => d.icd10 !== 'Z01.21' && d.icd10 !== 'Z01.20',
    );
    if (!hasFindingCode) {
      suggestions.push({
        rank: rank++,
        code: 'Z01.21',
        codeType: 'ICD10',
        description: 'Encounter for dental exam with abnormal findings — finding code missing',
        reasoning:
          'Z01.21 indicates abnormal findings during examination, but no additional diagnosis code is present to specify what was found. Add a specific finding code (e.g., K02.x for caries, K05.x for periodontal disease) to satisfy coding requirements.',
        isRecommended: false,
        auditRisk: 'medium',
      });
    }
  }

  // ---- Medicaid-specific: D4346 vs D1110 guidance -------------------------

  if (payerGroup === 'medicaid') {
    const hasD4346 = procedures.some((p) => p.cdt === 'D4346');
    if (hasD4346 && clinicalFindings.bopPercentage != null && clinicalFindings.bopPercentage < 30) {
      suggestions.push({
        rank: rank++,
        code: 'D4346',
        codeType: 'CDT',
        description: 'D4346 with low BOP percentage',
        reasoning: `D4346 (scaling in presence of generalized moderate/severe gingival inflammation) is coded but BOP is ${clinicalFindings.bopPercentage}%. Many Medicaid payers require BOP >= 30% for D4346 approval. Consider D1110 (prophylaxis) if inflammation is localized rather than generalized.`,
        isRecommended: false,
        auditRisk: 'high',
      });
    }
  }

  return suggestions;
}

// -----------------------------------------------------------------------------
// Severity badge color helper
// -----------------------------------------------------------------------------

function riskClassName(risk?: 'low' | 'medium' | 'high'): string {
  if (risk === 'high') return 'high';
  if (risk === 'medium') return 'medium';
  return 'low';
}

function riskBadgeClass(risk?: 'low' | 'medium' | 'high'): string {
  if (risk === 'high') return 'badge-danger';
  if (risk === 'medium') return 'badge-warning';
  return 'badge-success';
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const CodingSuggestionPanel: React.FC<CodingSuggestionPanelProps> = ({
  procedures,
  diagnoses,
  clinicalFindings,
  payerGroup,
}) => {
  const suggestions = useMemo(
    () => generateSuggestions(procedures, diagnoses, clinicalFindings, payerGroup),
    [procedures, diagnoses, clinicalFindings, payerGroup],
  );

  // Group suggestions by type for display
  const cdtSuggestions = suggestions.filter((s) => s.codeType === 'CDT');
  const icd10Suggestions = suggestions.filter((s) => s.codeType === 'ICD10');
  const cptSuggestions = suggestions.filter((s) => s.codeType === 'CPT');

  if (procedures.length === 0 && diagnoses.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Coding Suggestions</span>
        </div>
        <div className="panel-body">
          <div className="empty-state">
            <div className="empty-state-text">
              Add procedures and diagnoses to receive coding suggestions.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Coding Suggestions</span>
        {suggestions.length > 0 && (
          <span className="panel-badge badge-info">
            {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="panel-body">
        {suggestions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">
              No coding suggestions at this time. Current procedure and diagnosis
              selections appear appropriate.
            </div>
          </div>
        ) : (
          <>
            {/* CDT Code Suggestions (Section 5.1 / 5.4) */}
            {cdtSuggestions.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--gray-500)',
                    marginBottom: 8,
                  }}
                >
                  CDT Code Suggestions
                </h4>
                {cdtSuggestions.map((s) => (
                  <div
                    key={`cdt-${s.rank}`}
                    className="coding-suggestion"
                    style={{ marginBottom: 10 }}
                  >
                    <div
                      className={`audit-risk ${riskClassName(s.auditRisk)}`}
                      style={{ padding: '10px 14px' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: 14,
                          }}
                        >
                          {s.code}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {s.description}
                        </span>
                        <span
                          className={`panel-badge ${riskBadgeClass(s.auditRisk)}`}
                          style={{ marginLeft: 'auto', flexShrink: 0 }}
                        >
                          {s.auditRisk ?? 'low'} risk
                        </span>
                        {s.isRecommended && (
                          <span className="panel-badge badge-success">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                        {s.reasoning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ICD-10 Suggestions (Section 5.1 / 5.2) */}
            {icd10Suggestions.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--gray-500)',
                    marginBottom: 8,
                  }}
                >
                  Diagnosis Mapping Suggestions
                </h4>
                {icd10Suggestions.map((s) => (
                  <div
                    key={`icd-${s.rank}`}
                    className="coding-suggestion"
                    style={{ marginBottom: 10 }}
                  >
                    <div
                      className={`audit-risk ${riskClassName(s.auditRisk)}`}
                      style={{ padding: '10px 14px' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: 14,
                          }}
                        >
                          {s.code}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {s.description}
                        </span>
                        <span
                          className={`panel-badge ${riskBadgeClass(s.auditRisk)}`}
                          style={{ marginLeft: 'auto', flexShrink: 0 }}
                        >
                          {s.auditRisk ?? 'low'} risk
                        </span>
                        {s.isRecommended && (
                          <span className="panel-badge badge-success">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                        {s.reasoning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CPT Cross-Billing (Section 5.3) */}
            {cptSuggestions.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--gray-500)',
                    marginBottom: 8,
                  }}
                >
                  CPT Cross-Billing Opportunities
                </h4>
                {cptSuggestions.map((s) => (
                  <div
                    key={`cpt-${s.rank}`}
                    className="coding-suggestion"
                    style={{ marginBottom: 10 }}
                  >
                    <div
                      className={`audit-risk ${riskClassName(s.auditRisk)}`}
                      style={{ padding: '10px 14px' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: 14,
                          }}
                        >
                          {s.code}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {s.description}
                        </span>
                        <span
                          className={`panel-badge ${riskBadgeClass(s.auditRisk)}`}
                          style={{ marginLeft: 'auto', flexShrink: 0 }}
                        >
                          {s.auditRisk ?? 'low'} risk
                        </span>
                      </div>
                      <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                        {s.reasoning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Payer context note */}
        <div
          style={{
            fontSize: 12,
            color: 'var(--gray-400)',
            borderTop: '1px solid var(--gray-100)',
            paddingTop: 10,
            marginTop: 8,
          }}
        >
          Suggestions generated for payer group: <strong>{payerGroup}</strong>.
          All suggestions are advisory and should be verified by the provider.
        </div>
      </div>
    </div>
  );
};

export default CodingSuggestionPanel;
