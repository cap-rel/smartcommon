import PropTypes from "prop-types";

export const propTypes = {
    // Block rendering if no authenticated user is available, redirect instead.
    requireAuth: PropTypes.bool,
    // Block rendering if a user IS authenticated, redirect instead.
    // Used to keep already-logged-in users away from /login, /register, etc.
    requireGuest: PropTypes.bool,
    // Where to redirect when blocked. Defaults: "/login" for requireAuth,
    // "/" for requireGuest.
    redirectTo: PropTypes.string,
    // Optional children. When omitted, the guard renders <Outlet />, which
    // is the standard react-router v6/v7 pattern when used as a route element.
    children: PropTypes.node,
};

export const defaultProps = {
    requireAuth: false,
    requireGuest: false,
};
