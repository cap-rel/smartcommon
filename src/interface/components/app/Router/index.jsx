import { BrowserRouter, Route, Routes } from "react-router-dom";
import { componentNames } from "../../pages/SmartPage/components";
import { DevPage, SmartPage } from "../../pages";

export const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={`/`} element={<DevPage />}/>
                {/* {componentNames.map((component, CI) =>
                    <Route key={`component${CI}`} path={`/${component}`} element={<SmartPage />} />
                )} */}
            </Routes>
        </BrowserRouter>
    );
};