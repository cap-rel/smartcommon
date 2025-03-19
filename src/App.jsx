import { useEffect } from "react";
import { Head, I18nextProvider, ReduxProvider, Toaster } from "./components/app";
import { useWindow } from "./hooks";
import { DevPage, LoginPage, SmartPage } from "./components/pages";
import { Route, Router, Routes, BrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export const App = () => {
//   const { darkMode } = useWindow()
//   useEffect(() => {
//     const htmlClasses = document.querySelector("html").classList;
//     if (htmlClasses.contains("dark")) {
//       htmlClasses.remove("dark")
//     } else {
//       htmlClasses.add("dark");
//     }
// }, [darkMode]);

  const ProtectedRoutes = () => {
    const user = useSelector((state) => state.auth.user);
    return user ? <Outlet /> : <Navigate to="/login" />;
  };

  const PublicRoutes = () => {
    const user = useSelector((state) => state.auth.user);
    return user ? <Navigate to="/" /> :  <Outlet />;
  };


  return (
    <ReduxProvider>
      <I18nextProvider>
          <Head />
          <BrowserRouter>
            <Routes>
              <Route element={<PublicRoutes />}>
                <Route path={`/login`} element={<LoginPage />} />
              </Route>
              <Route element={<ProtectedRoutes />}>
                <Route path={`/`} element={<SmartPage />} />
                <Route path={`/2`} element={<DevPage />} />
                <Route path={`/3`} element={<DevPage />} />
                <Route path={`/4`} element={<DevPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />

          {/* For linear-gradient on borders */}
          {/* <svg width="0" height="0">
            <defs>
              <linearGradient id="gradientSvg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg> */}

      </I18nextProvider>
    </ReduxProvider>
  );
};