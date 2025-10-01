// import { Route } from "react-router-dom";
import { PrivateRoutes } from "./components/app/PrivateRoutes";
import { PublicRoutes } from "./components/app/PublicRoutes";
import { componentNames } from "./components/pages/SmartPage/components";
import { DevPage, SmartPage } from "./components";
import { ReactRouter } from "./components/app/ReactRouter";
import { Route } from "react-router-dom";

export const Router = () => {
    return (
        <ReactRouter>
            <Route path={`/dev`} element={<DevPage />}/>
                {/* {componentNames.map((component, CI) =>
                    <Route key={`component${CI}`} path={`/${component}`} element={<SmartPage />} />
                )} */}
        </ReactRouter>
    );
};