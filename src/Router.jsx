import { Route } from "react-router-dom";
import { PrivateRoutes } from "./components/app/PrivateRoutes";
import { PublicRoutes } from "./components/app/PublicRoutes";
import { componentNames } from "./components/pages/SmartPage/components";
import { DevPage, LoginPage, SmartPage } from "./components";
import { ReactRouter } from "./components/app/ReactRouter";

export const Router = () => {
    return (
        <ReactRouter>
            <Route element={<PublicRoutes/>}>
                <Route path={`/login`} element={<LoginPage />} />
            <Route path={`/2`} element={<DevPage />} /> 
            </Route>
            <Route element={<PrivateRoutes />}>
                {componentNames.map((component, CI) => 
                    <Route key={`component${CI}`} path={`/${component}`} element={<SmartPage />} />
                )}
                <Route path={`/3`} element={<DevPage />} />
                <Route path={`/4`} element={<DevPage />} />
            </Route>
        </ReactRouter>
    );        
};