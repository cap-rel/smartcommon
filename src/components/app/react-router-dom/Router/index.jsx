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
import PrivateRoutes from "../PrivateRoutes";
import PublicRoutes from "../PublicRoutes";
import { Error404PageDol, PageDol, PrivateLayoutDol, PublicLayoutDol } from "../../../dol";

import Nocode             from "../../../../Nocode";
import ConfigPage         from "../../../../Nocode/PresentationPage";

import PresentationPage   from "../../../../Nocode/PresentationPage";
import ConfigLayout       from "../../../../Nocode/ConfigLayout";
import ConfigAppPage      from "../../../../Nocode/ConfigAppPage";
import ConfigLanguagesPage from "../../../../Nocode/ConfigLanguagesPage";
import ConfigThemesPage   from "../../../../Nocode/ConfigThemesPage";
import ConfigEntitiesPage from "../../../../Nocode/ConfigEntitiesPage";
import ConfigEntityPage   from "../../../../Nocode/ConfigEntityPage";
import ConfigDataPage     from "../../../../Nocode/ConfigDataPage";

import LoginPage from "../../../../SmartNotes/LoginPage";
import HomePage from "../../../../SmartNotes/HomePage";
import NotesPage from "../../../../SmartNotes/NotesPage";
import ArchivesPage from "../../../../SmartNotes/ArchivesPage";
import SyncPage from "../../../../SmartNotes/SyncPage";
import SettingsPage from "../../../../SmartNotes/SettingsPage";

import TestPageDol        from "../../../dol/pages/private/TestPageDol";

const Router = (props) => {
  const { config } = props;

  const Routes = () => {    
    return (
      <BrowserRoutes>
        {/* <Route path={`/nocode`} element={<Nocode />} />
        <Route path={`/smartInterventions`} element={<PresentationPage />} />
        <Route element={<ConfigLayout />}>
          <Route path={`/smartInterventions/config/app`}      element={<ConfigAppPage />} />
          <Route path={`/smartInterventions/config/languages`} element={<ConfigLanguagesPage />} />
          <Route path={`/smartInterventions/config/themes`}   element={<ConfigThemesPage />} />
          <Route path={`/smartInterventions/config/entities`} element={<ConfigEntitiesPage />} />
          <Route path={`/smartInterventions/config/entity/:name`} element={<ConfigEntityPage />} />
          <Route path={`/smartInterventions/config/data`}     element={<ConfigDataPage />} />
        </Route> */}
<Route element={<PublicRoutes />}>

        <Route path={`/login`} element={<LoginPage />} />
</Route>
<Route element={<PrivateRoutes />}>
        <Route path={`/`} element={<HomePage />} />
        <Route path={`/notes`} element={<NotesPage />} />
        <Route path={`/:noteType/list`} element={<ArchivesPage />} />
        <Route path={`/sync`} element={<SyncPage />} />
        <Route path={`/settings`} element={<SettingsPage />} />

        <Route path={`/test`} element={<TestPageDol />} />
        </Route>


        {/* <Route element={<PublicRoutes />}>
          <Route element={<PublicLayoutDol config={config} />}>
            <Route path={`/login`          } element={<PageDol config={config} type={`login`         } />} />
            <Route path={`/register`       } element={<PageDol config={config} type={`register`      } />} />
            <Route path={`/forgot-password`} element={<PageDol config={config} type={`forgotPassword`} />} />
            <Route path={`/new-password`   } element={<PageDol config={config} type={`newPassword`   } />} />
          </Route>
        </Route>

        <Route element={<PrivateRoutes />}>
          <Route element={<PrivateLayoutDol config={config} />} >
            <Route path={`/`} element={<PageDol config={config} type={`list`} />} />
            <Route path={`/agenda`} element={<PageDol config={config} type={`smartDashboard`} />} />
            <Route path={`/deliveries`} element={<PageDol config={config} type={`smartDashboard`} />} />
            <Route path={`/settings`} element={<PageDol config={config} type={`smartDashboard`} />} />
          </Route>
        </Route> */}

        {/* VIEUX DOLIMOBILE */}

        {/* <Route element={<PublicRoutes />}> */}
          {/* {skel.routes.public.map((route, RI) => {
            return (
              <Route 
                key={RI}
                path={route.path} 
                element={<PageDol config={finalConfig} page={route.page} />}
              />
            );
          })} */}
        {/* </Route> */}
        {/* <Route element={<PrivateRoutes />}> */}
          {/* <Route 
            element={
              <PrivateLayoutDol 
                config={finalConfig} 
                navigation={skel.navigation} 
                navbar={skel.navbar || null} 
                page={skel.routes.private.find(route => matchPath(route.path, location.pathname))?.page}
              />
            }
          >
            {skel.routes.private.map((route, RI) => 
              <Route 
                key={RI}
                path={route.path} 
                element={<PageDol config={finalConfig} page={route.page} />}
              />
            )}
          </Route> */}
        {/* </Route> */}
        <Route path="*" element={<Error404PageDol />} />
      </BrowserRoutes>
    );
  }

  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
 
};

export default Router;