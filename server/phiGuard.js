// PHI guard shared by the dev server and the Vercel function.
// The intake bridge (api/intake-fetch.js, useChartStore.js) keeps its own
// copies by design — defense in depth across independently deployable layers.

export const PHI_KEYS = ['patientName', 'name', 'dob', 'medicaidId', 'ssn', 'address', 'phone']

export function findPhiKey(value) {
  if (value === null || typeof value !== 'object') return null
  if (Array.isArray(value)) {
    for (const item of value) {
      const hit = findPhiKey(item)
      if (hit) return hit
    }
    return null
  }
  for (const k of Object.keys(value)) {
    if (PHI_KEYS.includes(k)) return k
    const hit = findPhiKey(value[k])
    if (hit) return hit
  }
  return null
}
