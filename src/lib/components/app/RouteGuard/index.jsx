import { Navigate, Outlet } from "react-router-dom";

import { useApi } from "lib/hooks";

import { defaultProps, propTypes } from "./props";

export const RouteGuard = (props) => {
    const {
        requireAuth = false,
        requireGuest = false,
        redirectTo,
        children,
    } = props;

    if (requireAuth && requireGuest) {
        // Logical conflict. We pick requireAuth (the more restrictive of the
        // two) and warn so it shows up during development. Production builds
        // strip console.warn nothing in our toolchain so the cost is minimal.
        // eslint-disable-next-line no-console
        console.warn(
            "[RouteGuard] requireAuth and requireGuest were both set; falling back to requireAuth."
        );
    }

    const api = useApi();
    const isAuthenticated = !!api?.user;

    if (requireAuth && !isAuthenticated) {
        return <Navigate to={redirectTo ?? "/login"} replace />;
    }
    if (!requireAuth && requireGuest && isAuthenticated) {
        return <Navigate to={redirectTo ?? "/"} replace />;
    }

    return children ?? <Outlet />;
};

RouteGuard.propTypes = propTypes;
RouteGuard.defaultProps = defaultProps;
