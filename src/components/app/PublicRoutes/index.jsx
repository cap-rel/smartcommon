import { useSelector } from "react-redux";
import { Navigate, Outlet, Route } from "react-router-dom";

export const PublicRoutes = () => {
    const user = useSelector(state => state.auth.user);
    return user ? <Navigate to="/" replace/> : <Outlet />;
};