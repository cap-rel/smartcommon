import { BrowserRouter } from "react-router-dom";

export const Router = (props) => {
    const { children } = props;

    return (
        <BrowserRouter>
            {children}
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
