import { map } from "lodash";
import { BrowserRouter, Route, useRoutes } from "react-router-dom";

import { throwTypeError } from "lib/utils";
import { NavigationProvider } from "lib/components";

export const RouterContent = ({ children }) => {
    return (
        <NavigationProvider>
            {children}
        </NavigationProvider>
    );
};

export const Router = ({ children }) => {
    return (
        <BrowserRouter>
            <RouterContent>
                {children}
            </RouterContent>
        </BrowserRouter>
    );
};

 {/* {mapRoutes(routes)} */}

    // throwTypeError({ value: routes, name: "routes", type: ["array"] });

    // const mapRoutes = (routes) => 
    //     map(routes, ({ path, element, children = [] }, RI) => {
    //         throwTypeError({ value: children, name: "Route children", type: ["array"] });

    //         return (
    //             <Route key={`route${RI}`} path={path} element={element}>
    //                 {mapRoutes(children)}
    //             </Route>
    //         );
    //     });

    // const Routes = ({ routes }) => useRoutes(routes);
