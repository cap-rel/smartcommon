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
    // coords: locate()
};