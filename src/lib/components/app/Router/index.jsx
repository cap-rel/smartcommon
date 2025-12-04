import { BrowserRouter, Routes } from "react-router-dom";

export const Router = ({ children }) => {
    return (
        <BrowserRouter>
            <Routes>
                {children}
            </Routes>
        </BrowserRouter>
    );
};