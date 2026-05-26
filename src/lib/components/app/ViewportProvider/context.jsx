import { createContext } from "react";

// Semantic: "primary pointer is fine (mouse/trackpad)". UNIQUE
// criterion for desktop mode. Value changed from `1.0.333` where it
// was `(min-width: 768px)` -- the new semantic matches UI usage
// (target size, hover) instead of an arbitrary size.
export const DESKTOP_MEDIA_QUERY = "(pointer: fine)";

// Semantic: "primary pointer is coarse + large viewport". Approximate
// semantic on CSS side (the real JS test uses screen.width for
// reliability, see ViewportProvider/index.jsx).
export const TABLET_MEDIA_QUERY = "(pointer: coarse) and (min-width: 600px)";

// Inverse of TABLET_MEDIA_QUERY.
export const MOBILE_MEDIA_QUERY = "(pointer: coarse) and (max-width: 599.98px)";

// JS short-side threshold (in CSS pixels) that splits mobile from
// tablet. Frozen for this release: changing the threshold would
// silently break detection on every consumer with no chance to
// coordinate a simultaneous bump. Note: foldables like Galaxy Fold
// (~673 px short side when unfolded) classify as tablet, which is
// the intended behaviour.
export const MOBILE_MAX_SHORT_SIDE_PX = 600;

export const VIEWPORT_PREFERENCE_KEY = "smartcommon.viewport.preference";

export const ViewportContext = createContext(null);
