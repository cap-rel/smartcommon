import { map } from "lodash";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { throwTypeError } from "lib/utils";
import { NavigationProvider } from "lib/components";

export const Router = ({ routes = [] }) => {
    throwTypeError({ value: routes, name: "routes", type: ["array"] });

    const mapRoutes = (routes) => 
        map(routes, ({ path, element, children = [] }, RI) => {
            throwTypeError({ value: children, name: "Route children", type: ["array"] });

            return (
                <Route key={`route${RI}`} path={path} element={element}>
                    {mapRoutes(children)}
                </Route>
            );
        });

    return (
        <BrowserRouter>
            <NavigationProvider>
                <Routes>
                    {mapRoutes(routes)}
                </Routes>
            </NavigationProvider>
        </BrowserRouter>
    );
};