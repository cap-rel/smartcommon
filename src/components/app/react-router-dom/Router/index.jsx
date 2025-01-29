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
import { Error404PageDol } from "../../../dol";


const Router = (props) => {
  const { config } = props;

  const Routes = () => {    
    return (
      <BrowserRoutes>
        <Route element={<PublicRoutes />}></Route>
        <Route element={<PrivateRoutes />}></Route>
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