import { Route } from "react-router-dom";
import { PrivateRoutes } from "./components/app/PrivateRoutes";
import { PublicRoutes } from "./components/app/PublicRoutes";
import { componentNames } from "./components/pages/SmartPage/components";
import { DevPage, LoginPage, SmartPage } from "./components";
import { ReactRouter } from "./components/app/ReactRouter";
import ListPage from "./components/pages/ListPage";
import HomePage from "./components/pages/HomePage";
import InterventionsPage from "./components/pages/InterventionsPage";
import { SettingsPage } from "./components/pages/settingsPage";
import { FormPage } from "./components/pages/FormPage";

export const Router = () => {
    return (
        <ReactRouter>
            <Route element={<PublicRoutes/>}>
                <Route path={`/login`} element={<LoginPage />} />
                {/* <Route path={`/2`} element={<DevPage />} /> */}
            </Route>
            <Route element={<PrivateRoutes />}>
                <Route path={`/`} element={<HomePage />} />
                <Route path={`/interventions`} element={<InterventionsPage />} />
                <Route path={`/settings`} element={<SettingsPage />} />
                <Route path={`/intervention/:id`} element={<FormPage />} />
                {/* {componentNames.map((component, CI) => 
                    <Route key={`component${CI}`} path={`/${component}`} element={<SmartPage />} />
                )} */}
            </Route>
        </ReactRouter>
    );        
};