import { BrowserRouter, Route, Routes } from "react-router-dom";
import { componentNames } from "../../pages/SmartPage/components";
import { DevPage, SmartPage } from "../../pages";
import { DevPage2 } from "../../pages/DevPage2";

export const Router = () => {    
    return (
        <BrowserRouter>
            {/* <NavigationProvider> */}
                <Routes>
                    <Route path={`/`} element={<DevPage />}/>
                    <Route path={`/dev2`} element={<DevPage2 />}/>
                    {/* {componentNames.map((component, CI) =>
                        <Route key={`component${CI}`} path={`/${component}`} element={<SmartPage />} />
                    )} */}
                </Routes>
            {/* </NavigationProvider> */}
        </BrowserRouter>
    );
};