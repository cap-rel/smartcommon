import { useStates } from "../../hooks";

export const useNavigator = () => {
  const isNavigatorAvailable = typeof navigator !== "undefined";

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

  const { states, set } = useStates({
    deviceType: "tablet",
    language: getLanguage()
  })

  return states;
};
