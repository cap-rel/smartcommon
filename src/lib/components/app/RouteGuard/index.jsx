import { Navigate, Outlet } from "react-router-dom";

import { useApi } from "lib/hooks";

import { defaultProps, propTypes } from "./props";
import { createLogger } from "lib/utils";

const logger = createLogger("RouteGuard");

const LOGIN_PATH = "/login";
const HOME_PATH = "/";
const IDENTIFY_DEVICE_PATH = "/device-identification";

export const RouteGuard = (props) => {
    const {
        requireAuth = false,
        requireGuest = false,
        requireDeviceIdentification = false,
        requireDeviceIdentified = false,
        redirectTo,
        children,
    } = props;

    // Detect logically-conflicting prop combinations and pick the most
    // restrictive one. The warning goes through the library logger, so it
    // also shows in production (default level "warn").
    if (requireAuth && requireGuest) {
        logger.warning(
            "[RouteGuard] requireAuth and requireGuest were both set; falling back to requireAuth."
        );
    }
    if (requireDeviceIdentification && requireDeviceIdentified) {
        logger.warning(
            "[RouteGuard] requireDeviceIdentification and requireDeviceIdentified were both set; falling back to requireDeviceIdentification."
        );
    }

    const api = useApi();
    const isAuthenticated = Boolean(api?.user);
    const hasDeviceOptions = Boolean(api?.user?.deviceOptions);
    // useApi.login() persists the user BEFORE <LoginComponent> renders its
    // device picker (needs_device_pick from smartAuth). Sending that user away
    // from the guest route at that point unmounts the picker before it shows,
    // so the technical device is never attached and every later login asks
    // again. The guest route stays open until the pick is done.
    const isPickingDevice = api?.user?.needsDevicePick === true;

    // Auth modes (mutually exclusive after the warn above)
    if (requireAuth && !isAuthenticated) {
        return <Navigate to={redirectTo ?? LOGIN_PATH} replace />;
    }
    if (!requireAuth && requireGuest && isAuthenticated && !isPickingDevice) {
        return <Navigate to={redirectTo ?? HOME_PATH} replace />;
    }

    // Device modes always require auth: kick to login if no user
    if ((requireDeviceIdentification || requireDeviceIdentified) && !isAuthenticated) {
        return <Navigate to={LOGIN_PATH} replace />;
    }

    // requireDeviceIdentification: only render when there ARE device options
    // to pick from (i.e. the user has not yet chosen a device).
    if (requireDeviceIdentification && !hasDeviceOptions) {
        return <Navigate to={redirectTo ?? HOME_PATH} replace />;
    }

    // requireDeviceIdentified: only render when the user has already chosen
    // a device (i.e. deviceOptions has been cleared by api.identifyDevice).
    if (!requireDeviceIdentification && requireDeviceIdentified && hasDeviceOptions) {
        return <Navigate to={redirectTo ?? IDENTIFY_DEVICE_PATH} replace />;
    }

    return children ?? <Outlet />;
};

RouteGuard.propTypes = propTypes;
RouteGuard.defaultProps = defaultProps;
