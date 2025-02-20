/*
 * Router
 *
 * Copyright (c) 2024 Paolo Debaisieux <paolo.debaisieux@cap-rel.fr>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { BrowserRouter, Route, Routes as BrowserRoutes, useLocation, matchPath } from "react-router-dom";
import { ProtectedRoutes } from "../ProtectedRoutes";
import { PublicRoutes } from "../PublicRoutes";

import { Error404Page } from "../../../pages/errors/Error404Page"
import { PrivateLayout } from "../../../layouts/test/PrivateLayout";
import { HomePage } from "../../../pages/test/HomePage";
import { NotesPage } from "../../../pages/test/NotesPage";
import { SyncPage } from "../../../pages/test/SyncPage";
import { SettingsPage } from "../../../pages/test/SettingsPage";

export const Router = (props) => {
  const { config } = props;

  const Routes = () => {    
    return (
      <BrowserRoutes>
        {/* <Route element={<PublicRoutes />}>
          <Route path={`/login`} element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoutes />}>
          <Route path={`/`} element={<HomePage />} />
        </Route> */}
        <Route path={`/`} element={<HomePage />} /> 
        <Route path={`/notes`} element={<NotesPage />} /> 
        <Route path={`/sync`} element={<SyncPage />} /> 
        <Route path={`/settings`} element={<SettingsPage />} /> 
        <Route path={`*`} element={<Error404Page />} /> 
      </BrowserRoutes>
    );
  };

  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
 
};