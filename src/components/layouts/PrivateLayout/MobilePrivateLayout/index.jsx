/*
 * PrivateLayout
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

import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { hexToRgb, isEmpty } from "../../../../globals/functions";
import { Tabbar, Sidebar } from "../../../navigation";

export const MobilePrivateLayout = (props) => {
  const { config } = props;

  const darkMode = config.darkMode;

  // const deviceType = config.deviceType;
  const deviceType = "mobile";
  const orientation =  config.orientation;
  // const navigation = config.app.navigation[`${deviceType}${orientation.charAt(0).toUpperCase() + orientation.slice(1)}`]
  const navigation = config.app.navigation.tabletPortrait;

  const finalConfig = { ...config, navigation: navigation };

  return (
    <div className={`
        fixed overflow-auto top-0 right-0 left-0 bg-soft-smt
        ${navigation === "tabbar" ? "bottom-18" : "bottom-0"}
      `}
      // style={{ backgroundImage: `linear-gradient(to right, rgb(${hexToRgb(!darkMode ? secondaryColor : "#000000")}, 0.7), rgb(${hexToRgb(primaryColor)}, 0.7), rgb(${hexToRgb(!darkMode ? secondaryColor : "#000000")}, 0.7))` }}
    >
      {/* <div 
        className="hidden lg:block absolute blur-3xl left-80 top-144 h-80 w-80 rounded-full" 
        style={{ backgroundColor: `rgb(${hexToRgb(darkMode ? secondaryColor : primaryColor)}, 0.6)` }}
      />
      <div 
        className="hidden lg:block absolute blur-3xl left-30 top-50 h-60 w-60 rounded-full"
        style={{ backgroundColor: `rgb(${hexToRgb(darkMode ? secondaryColor : primaryColor)}, 0.6)` }}
      />
      <div 
        className="hidden lg:block absolute blur-3xl right-40 top-0 translate-x-1/2 h-100 w-100 rounded-full"
        style={{ backgroundColor: `rgb(${hexToRgb(darkMode ? secondaryColor : primaryColor)}, 0.6)` }}
      /> */}
      <div className={`${navigation !== "tabbar" && "mb-18"}`}>
        <Outlet />
      </div>
      {navigation === "tabbar" 
        ? <Tabbar config={finalConfig} /> 
        : <Sidebar config={finalConfig} />
      }
    </div>
  );
};