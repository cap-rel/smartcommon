import PropTypes from "prop-types";

export const propTypes = {
    // Block rendering if no authenticated user is available, redirect instead.
    requireAuth: PropTypes.bool,
    // Block rendering if a user IS authenticated, redirect instead.
    // Used to keep already-logged-in users away from /login, /register, etc.
    requireGuest: PropTypes.bool,
    // Block rendering unless user.deviceOptions IS set (= the user must
    // pick / register a device). Used for the device identification page.
    // Implies requireAuth: redirects to "/login" if no user.
    requireDeviceIdentification: PropTypes.bool,
    // Block rendering unless user.deviceOptions is NOT set (= the user has
    // already picked their device and may use the app). Used for all the
    // post-auth + post-device-identification pages.
    // Implies requireAuth: redirects to "/login" if no user.
    requireDeviceIdentified: PropTypes.bool,
    // Where to redirect when blocked. Per-mode defaults:
    //   requireAuth                  -> "/login"
    //   requireGuest                 -> "/"
    //   requireDeviceIdentification  -> "/" (user already identified)
    //   requireDeviceIdentified      -> "/device-identification"
    // For requireDeviceIdentification/Identified, when the user is missing
    // we always redirect to "/login" regardless of redirectTo.
    redirectTo: PropTypes.string,
    // Optional children. When omitted, the guard renders <Outlet />, which
    // is the standard react-router v6/v7 pattern when used as a route element.
    children: PropTypes.node,
};

export const defaultProps = {
    requireAuth: false,
    requireGuest: false,
    requireDeviceIdentification: false,
    requireDeviceIdentified: false,
};
