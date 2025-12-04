import { BrowserRouter, Outlet, Routes } from "react-router-dom";

export const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Outlet />
            </Routes>
        </BrowserRouter>
    );
};