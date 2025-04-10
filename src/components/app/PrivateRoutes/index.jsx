import { useSelector } from "react-redux";
import { Navigate, Outlet, Route } from "react-router-dom";

export const PrivateRoutes = () => {
    const user = useSelector(state => state.auth.user);
    return user ? <Outlet /> : <Navigate to="/login" replace/>;
};