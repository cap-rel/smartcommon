import { useSelector } from "react-redux";
import { Navigate, Outlet, Route } from "react-router-dom";
import { isNil } from "../../../globals";
import { useEffect } from "react";

export const PublicRoutes = () => {
    const auth = useSelector(state => state.session.data.auth);
    return auth ? <Navigate to="/" replace/> : <Outlet />;
};