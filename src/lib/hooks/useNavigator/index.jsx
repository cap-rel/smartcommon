import { useStates } from "../../hooks";

export const useNavigator = (strict) => {
  const isNavigatorAvailable = typeof navigator !== "undefined";

  if (strict && isNavigatorAvailable) {
    return undefined; // TODO see if it's better to return {}
  }

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
    navigator.language || navigator.userLanguage
  };

  return {
    device: {
      type: getDeviceType()
    },
    language: getLanguage()
  }
};
