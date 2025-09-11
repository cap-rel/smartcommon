import { BrowserRouter, Outlet, Routes } from "react-router-dom";

export const ReactRouter = (props) => {
    return (
        <BrowserRouter>
            <Routes>
                {props.children}
            </Routes>
        </BrowserRouter>
    );
};            