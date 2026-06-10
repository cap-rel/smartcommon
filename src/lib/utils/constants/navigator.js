import { isUndefined } from "lodash";

const isNavigatorAvailable = isUndefined(navigator);

const getDeviceType = () => {
    if (!isNavigatorAvailable) {
      return "mobile";
    }

    const isMobile = /Android.*Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet|Kindle|Silk/i.test(navigator.userAgent);
    
    return isMobile ? "mobile" : (isTablet ? "tablet" : "desktop");
  }

const getLanguage = () => {
    if (!isNavigatorAvailable) {
        return "en";
    }

    return navigator.language || navigator.userLanguage;
};

const locate = (success = () => {}, error = () => {}) => {
    navigator.geolocation.getCurrentPosition(
        position => {
          const coords = [position.coords.latitude, position.coords.longitude];
          console.log(`Geolocation success`, coords);
          success(coords);
        },
        err => {
          console.error(`Geolocation error`, err);
          error(err);
        }
    )
}

export const navigatorInfo = {
    device: {
      type: getDeviceType()
    },
    language: getLanguage(),
    // Live connectivity flag read by useApi's circuit breaker. It MUST track
    // online/offline at runtime: a frozen snapshot (here it can even load as
    // false when the module first evaluates without a ready `navigator`) left the
    // breaker convinced it was permanently offline, so it re-opened on every
    // drain attempt and queued offline work never flushed on reconnect
    // (smartInterventions E2E 84-offline-intervention-submit-queue).
    isOnLine: isNavigatorAvailable ? true : navigator.onLine
    // coords: locate()
};

// Keep the flag live. Without these listeners isOnLine is stuck at its load-time
// value forever, breaking every offline->online recovery path that reads it.
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("online", () => { navigatorInfo.isOnLine = true; });
    window.addEventListener("offline", () => { navigatorInfo.isOnLine = false; });
}