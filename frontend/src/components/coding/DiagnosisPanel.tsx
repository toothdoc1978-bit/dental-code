import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Diagnosis, Procedure } from '../../types/visit';
import { ICD10_CODES, ICD10Code } from '../../data/icd10Codes';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface DiagnosisPanelProps {
  diagnoses: Diagnosis[];
  procedures: Procedure[];
  cariesDepth?: string;
  onAdd: (diag: Omit<Diagnosis, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Diagnosis>) => void;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** K02.9 specificity codes — if caries depth is documented, a more specific
 *  code should be used instead of the unspecified K02.9. */
const SPECIFIC_CARIES_CODES: Record<string, { code: string; label: string }[]> = {
  enamel: [
    { code: 'K02.51', label: 'pit/fissure, enamel' },
    { code: 'K02.61', label: 'smooth surface, enamel' },
  ],
  dentin: [
    { code: 'K02.52', label: 'pit/fissure, dentin' },
    { code: 'K02.62', label: 'smooth surface, dentin' },
  ],
  pulp: [
    { code: 'K02.53', label: 'pit/fissure, pulp' },
    { code: 'K02.63', label: 'smooth surface, pulp' },
  ],
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const DiagnosisPanel: React.FC<DiagnosisPanelProps> = ({
  diagnoses,
  procedures,
  cariesDepth,
  onAdd,
  onUpdate,
  onRemove,
  onSetPrimary,
}) => {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // -- Close dropdown on outside click ----------------------------------------
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // -- Filtered codes ---------------------------------------------------------
  const filteredCodes = useMemo(() => {
    if (!search.trim()) return ICD10_CODES.slice(0, 20);
    const q = search.toLowerCase();
    return ICD10_CODES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [search]);

  // -- Already-added codes (avoid duplicates) ---------------------------------
  const addedCodes = useMemo(
    () => new Set(diagnoses.map((d) => d.icd10)),
    [diagnoses],
  );

  // -- Add a diagnosis --------------------------------------------------------
  const handleAdd = useCallback(
    (code: ICD10Code) => {
      if (addedCodes.has(code.code)) return;
      onAdd({
        icd10: code.code,
        description: code.description,
        isPrimary: diagnoses.length === 0, // first one is primary by default
        linkedProcedures: [],
      });
      setSearch('');
      setShowDropdown(false);
    },
    [addedCodes, diagnoses.length, onAdd],
  );

  // -- Toggle procedure link --------------------------------------------------
  const toggleProcedureLink = useCallback(
    (diagId: string, procId: string, currentLinks: string[]) => {
      const updated = currentLinks.includes(procId)
        ? currentLinks.filter((id) => id !== procId)
        : [...currentLinks, procId];
      onUpdate(diagId, { linkedProcedures: updated });
    },
    [onUpdate],
  );

  // -- Warnings ---------------------------------------------------------------
  const warnings = useMemo(() => {
    const result: { type: 'warning' | 'danger'; message: string }[] = [];

    const hasZ0121 = diagnoses.some((d) => d.icd10 === 'Z01.21');
    if (hasZ0121) {
      const hasFindingCode = diagnoses.some(
        (d) => d.icd10 !== 'Z01.21' && d.icd10 !== 'Z01.20',
      );
      if (!hasFindingCode) {
        result.push({
          type: 'warning',
          message:
            'Z01.21 (exam with abnormal findings) is selected but no additional finding code is present. Add a specific diagnosis code to document the abnormal finding.',
        });
      }
    }

    const hasK029 = diagnoses.some((d) => d.icd10 === 'K02.9');
    if (hasK029 && cariesDepth) {
      const suggestions = SPECIFIC_CARIES_CODES[cariesDepth];
      if (suggestions) {
        const codeList = suggestions.map((s) => `${s.code} (${s.label})`).join(', ');
        result.push({
          type: 'warning',
          message: `K02.9 (caries, unspecified) is used but caries depth "${cariesDepth}" is documented. Consider using a more specific code: ${codeList}.`,
        });
      }
    }

    return result;
  }, [diagnoses, cariesDepth]);

  // -- Render -----------------------------------------------------------------
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Diagnoses</span>
        {diagnoses.length > 0 && (
          <span className="panel-badge badge-info">
            {diagnoses.length} diagnosis{diagnoses.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      <div className="panel-body">
        {/* Warnings */}
        {warnings.map((w, i) => (
          <div
            key={i}
            className={`audit-risk ${w.type === 'danger' ? 'high' : 'medium'}`}
            style={{ marginBottom: 12 }}
          >
            <div
              className={`audit-risk-title ${w.type === 'danger' ? 'high' : 'medium'}`}
            >
              Warning
            </div>
            <p style={{ fontSize: 13 }}>{w.message}</p>
          </div>
        ))}

        {/* ICD-10 Search */}
        <div
          className="form-group"
          style={{ marginBottom: 16, position: 'relative' }}
        >
          <label className="form-label">Add ICD-10 Diagnosis</label>
          <input
            ref={inputRef}
            className="form-input"
            type="text"
            placeholder="Search ICD-10 code or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filteredCodes.length > 0 && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                background: 'white',
                border: '1px solid var(--gray-200)',
                borderRadius: 6,
                boxShadow: 'var(--shadow-md)',
                maxHeight: 240,
                overflowY: 'auto',
              }}
            >
              {filteredCodes.map((c) => {
                const alreadyAdded = addedCodes.has(c.code);
                return (
                  <div
                    key={c.code}
                    style={{
                      padding: '8px 12px',
                      cursor: alreadyAdded ? 'default' : 'pointer',
                      fontSize: 13,
                      borderBottom: '1px solid var(--gray-100)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      opacity: alreadyAdded ? 0.5 : 1,
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => !alreadyAdded && handleAdd(c)}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: 'var(--primary)',
                        minWidth: 72,
                      }}
                    >
                      {c.code}
                    </span>
                    <span style={{ color: 'var(--gray-600)' }}>{c.description}</span>
                    {alreadyAdded && (
                      <span
                        className="tag"
                        style={{ marginLeft: 'auto', flexShrink: 0 }}
                      >
                        Added
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Diagnosis List */}
        {diagnoses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">
              No diagnoses added. Search above to add ICD-10 codes.
            </div>
          </div>
        ) : (
          <div>
            {diagnoses.map((diag) => (
              <div
                key={diag.id}
                className="procedure-item"
                style={{
                  borderLeft: diag.isPrimary
                    ? '3px solid var(--primary)'
                    : undefined,
                }}
              >
                {/* Header row */}
                <div className="procedure-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="procedure-code">{diag.icd10}</span>
                    <span className="procedure-desc">{diag.description}</span>
                    {diag.isPrimary && (
                      <span className="panel-badge badge-success">Primary</span>
                    )}
                  </div>
                  <div className="btn-group">
                    {!diag.isPrimary && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => onSetPrimary(diag.id)}
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onRemove(diag.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Procedure Linking */}
                {procedures.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <span
                      className="form-label"
                      style={{ display: 'block', marginBottom: 4 }}
                    >
                      Linked Procedures
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {procedures.map((proc) => (
                        <div key={proc.id} className="form-checkbox-group">
                          <input
                            type="checkbox"
                            id={`link-${diag.id}-${proc.id}`}
                            checked={diag.linkedProcedures.includes(proc.id)}
                            onChange={() =>
                              toggleProcedureLink(
                                diag.id,
                                proc.id,
                                diag.linkedProcedures,
                              )
                            }
                          />
                          <label htmlFor={`link-${diag.id}-${proc.id}`}>
                            {proc.cdt}
                            {proc.tooth != null ? ` #${proc.tooth}` : ''}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisPanel;
