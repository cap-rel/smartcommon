import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, Route } from "react-router-dom";
import { isNil } from "../../../globals";

export const PrivateRoutes = () => {
    const auth = useSelector(state => state.session.data.auth);
    return auth ? <Outlet /> : <Navigate to="/login" replace />;
};