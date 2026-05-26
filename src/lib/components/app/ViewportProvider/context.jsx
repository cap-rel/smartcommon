import { createContext } from "react";

export const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";
export const VIEWPORT_PREFERENCE_KEY = "smartcommon.viewport.preference";

export const ViewportContext = createContext(null);
