// Single source of truth for whether real photography has been added to /public.
// While false, the <Media> component renders branded gradient placeholders so the
// site looks polished without photos. When the real images listed in
// public/IMAGES.md are dropped into place, flip this to `true` (or wire per-file
// checks) and <Media> swaps in next/image automatically — no other changes needed.
export const IMAGES_READY = false;
