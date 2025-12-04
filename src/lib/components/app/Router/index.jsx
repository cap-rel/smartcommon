import { BrowserRouter, Routes } from "react-router-dom";

export const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Outlet />
            </Routes>
        </BrowserRouter>
    );
};