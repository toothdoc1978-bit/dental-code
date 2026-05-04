import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Procedure, Surface } from '../../types/visit';
import { CDT_CODES, CDTCode } from '../../data/cdtCodes';
import { ICD10_CODES, ICD10Code, getICD10CodesForProcedure } from '../../data/icd10Codes';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ProcedureEntryPanelProps {
  procedures: Procedure[];
  onAdd: (proc: Omit<Procedure, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Procedure>) => void;
  onRemove: (id: string) => void;
}

const ALL_SURFACES: Surface[] = ['M', 'O', 'D', 'B', 'L', 'I', 'F'];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const ProcedureEntryPanel: React.FC<ProcedureEntryPanelProps> = ({
  procedures,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  // -- Form state -------------------------------------------------------------
  const [cdtSearch, setCdtSearch] = useState('');
  const [selectedCdt, setSelectedCdt] = useState<CDTCode | null>(null);
  const [toothNumber, setToothNumber] = useState('');
  const [surfaces, setSurfaces] = useState<Surface[]>([]);
  const [icd10Search, setIcd10Search] = useState('');
  const [selectedIcd10, setSelectedIcd10] = useState<ICD10Code | null>(null);
  const [showCdtDropdown, setShowCdtDropdown] = useState(false);
  const [showIcd10Dropdown, setShowIcd10Dropdown] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const cdtInputRef = useRef<HTMLInputElement>(null);
  const icd10InputRef = useRef<HTMLInputElement>(null);
  const cdtDropdownRef = useRef<HTMLDivElement>(null);
  const icd10DropdownRef = useRef<HTMLDivElement>(null);

  // -- Close dropdowns on outside click ---------------------------------------
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        cdtDropdownRef.current &&
        !cdtDropdownRef.current.contains(e.target as Node) &&
        cdtInputRef.current &&
        !cdtInputRef.current.contains(e.target as Node)
      ) {
        setShowCdtDropdown(false);
      }
      if (
        icd10DropdownRef.current &&
        !icd10DropdownRef.current.contains(e.target as Node) &&
        icd10InputRef.current &&
        !icd10InputRef.current.contains(e.target as Node)
      ) {
        setShowIcd10Dropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // -- Filtered CDT codes -----------------------------------------------------
  const filteredCdtCodes = useMemo(() => {
    if (!cdtSearch.trim()) return CDT_CODES.slice(0, 20);
    const q = cdtSearch.toLowerCase();
    return CDT_CODES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [cdtSearch]);

  // -- Filtered ICD-10 codes (contextual if CDT selected) ---------------------
  const filteredIcd10Codes = useMemo(() => {
    let pool = ICD10_CODES;
    // If a CDT code is selected, prioritise related ICD-10 codes
    if (selectedCdt) {
      const related = getICD10CodesForProcedure(selectedCdt.code);
      if (related.length > 0 && !icd10Search.trim()) {
        return related.slice(0, 20);
      }
    }
    if (!icd10Search.trim()) return pool.slice(0, 20);
    const q = icd10Search.toLowerCase();
    return pool
      .filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [icd10Search, selectedCdt]);

  // -- Surface toggle ---------------------------------------------------------
  const toggleSurface = useCallback((s: Surface) => {
    setSurfaces((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }, []);

  // -- Select CDT code --------------------------------------------------------
  const handleSelectCdt = useCallback((code: CDTCode) => {
    setSelectedCdt(code);
    setCdtSearch(`${code.code} — ${code.description}`);
    setShowCdtDropdown(false);
  }, []);

  // -- Select ICD-10 code -----------------------------------------------------
  const handleSelectIcd10 = useCallback((code: ICD10Code) => {
    setSelectedIcd10(code);
    setIcd10Search(`${code.code} — ${code.description}`);
    setShowIcd10Dropdown(false);
  }, []);

  // -- Reset form -------------------------------------------------------------
  const resetForm = useCallback(() => {
    setCdtSearch('');
    setSelectedCdt(null);
    setToothNumber('');
    setSurfaces([]);
    setIcd10Search('');
    setSelectedIcd10(null);
    setEditingId(null);
  }, []);

  // -- Populate form for editing ----------------------------------------------
  const handleEdit = useCallback(
    (proc: Procedure) => {
      const cdtCode = CDT_CODES.find((c) => c.code === proc.cdt);
      const icd10Code = ICD10_CODES.find((c) => c.code === proc.icd10);
      setEditingId(proc.id);
      setSelectedCdt(cdtCode || null);
      setCdtSearch(
        cdtCode
          ? `${cdtCode.code} — ${cdtCode.description}`
          : proc.cdt,
      );
      setToothNumber(proc.tooth?.toString() || '');
      setSurfaces([...proc.surfaces]);
      setSelectedIcd10(icd10Code || null);
      setIcd10Search(
        icd10Code
          ? `${icd10Code.code} — ${icd10Code.description}`
          : proc.icd10,
      );
    },
    [],
  );

  // -- Add / Update handler ---------------------------------------------------
  const handleSubmit = useCallback(() => {
    if (!selectedCdt || !selectedIcd10) return;

    const tooth = toothNumber ? parseInt(toothNumber, 10) : undefined;
    if (tooth !== undefined && (tooth < 1 || tooth > 32)) return;

    if (editingId) {
      onUpdate(editingId, {
        cdt: selectedCdt.code,
        cdtDescription: selectedCdt.description,
        tooth,
        surfaces,
        icd10: selectedIcd10.code,
        procFields: {},
      });
    } else {
      onAdd({
        cdt: selectedCdt.code,
        cdtDescription: selectedCdt.description,
        tooth,
        surfaces,
        icd10: selectedIcd10.code,
        procFields: {},
      });
    }

    resetForm();
  }, [
    selectedCdt,
    selectedIcd10,
    toothNumber,
    surfaces,
    editingId,
    onAdd,
    onUpdate,
    resetForm,
  ]);

  // -- Validate tooth number input --------------------------------------------
  const handleToothChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '' || (/^\d{1,2}$/.test(val) && Number(val) <= 32)) {
        setToothNumber(val);
      }
    },
    [],
  );

  // -- Render -----------------------------------------------------------------
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Procedure Entry</span>
        {procedures.length > 0 && (
          <span className="panel-badge badge-info">
            {procedures.length} procedure{procedures.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="panel-body">
        {/* CDT Code Search */}
        <div className="form-group" style={{ marginBottom: 12, position: 'relative' }}>
          <label className="form-label">CDT Code</label>
          <input
            ref={cdtInputRef}
            className="form-input"
            type="text"
            placeholder="Search CDT code or description..."
            value={cdtSearch}
            onChange={(e) => {
              setCdtSearch(e.target.value);
              setSelectedCdt(null);
              setShowCdtDropdown(true);
            }}
            onFocus={() => setShowCdtDropdown(true)}
          />
          {showCdtDropdown && filteredCdtCodes.length > 0 && (
            <div
              ref={cdtDropdownRef}
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
              {filteredCdtCodes.map((c) => (
                <div
                  key={c.code}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 13,
                    borderBottom: '1px solid var(--gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectCdt(c)}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: 'var(--primary)',
                      minWidth: 52,
                    }}
                  >
                    {c.code}
                  </span>
                  <span style={{ color: 'var(--gray-600)' }}>{c.description}</span>
                  {c.auditSensitive && (
                    <span
                      className="panel-badge badge-warning"
                      style={{ marginLeft: 'auto', flexShrink: 0 }}
                    >
                      Audit
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tooth + Surfaces row */}
        <div className="form-grid" style={{ marginBottom: 12 }}>
          <div className="form-group">
            <label className="form-label">Tooth # (1-32)</label>
            <input
              className="form-input"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 14"
              value={toothNumber}
              onChange={handleToothChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Surfaces</label>
            <div className="surface-picker">
              {ALL_SURFACES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`surface-btn${surfaces.includes(s) ? ' active' : ''}`}
                  onClick={() => toggleSurface(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ICD-10 Search */}
        <div className="form-group" style={{ marginBottom: 16, position: 'relative' }}>
          <label className="form-label">ICD-10 Diagnosis</label>
          <input
            ref={icd10InputRef}
            className="form-input"
            type="text"
            placeholder="Search ICD-10 code or description..."
            value={icd10Search}
            onChange={(e) => {
              setIcd10Search(e.target.value);
              setSelectedIcd10(null);
              setShowIcd10Dropdown(true);
            }}
            onFocus={() => setShowIcd10Dropdown(true)}
          />
          {showIcd10Dropdown && filteredIcd10Codes.length > 0 && (
            <div
              ref={icd10DropdownRef}
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
              {filteredIcd10Codes.map((c) => (
                <div
                  key={c.code}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 13,
                    borderBottom: '1px solid var(--gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectIcd10(c)}
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
                  <span
                    className="tag"
                    style={{ marginLeft: 'auto', flexShrink: 0 }}
                  >
                    {c.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add / Update Button */}
        <div className="btn-group" style={{ marginBottom: 20 }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedCdt || !selectedIcd10}
            onClick={handleSubmit}
          >
            {editingId ? 'Update Procedure' : 'Add Procedure'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>

        {/* Procedure List */}
        {procedures.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">
              No procedures added yet. Use the form above to add a procedure.
            </div>
          </div>
        ) : (
          <div>
            {procedures.map((proc) => (
              <div key={proc.id} className="procedure-item">
                <div className="procedure-header">
                  <div>
                    <span className="procedure-code">{proc.cdt}</span>
                    <span className="procedure-desc">
                      {proc.cdtDescription || ''}
                    </span>
                  </div>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleEdit(proc)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onRemove(proc.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="procedure-detail">
                  {proc.tooth != null && <>Tooth #{proc.tooth}</>}
                  {proc.surfaces.length > 0 && (
                    <>
                      {proc.tooth != null ? ' | ' : ''}
                      Surfaces: {proc.surfaces.join(', ')}
                    </>
                  )}
                  {' | '}Dx: {proc.icd10}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcedureEntryPanel;
