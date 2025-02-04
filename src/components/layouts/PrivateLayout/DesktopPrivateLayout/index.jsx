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
import { useSelector } from "react-redux";
import { Sidebar } from "../../../navigation";
import { useNavigator, useWindow } from "../../../../hooks";

export const DesktopPrivateLayout = (props) => {
    const { config } = props;

    const { darkMode, orientation } = useWindow();
    const { deviceType } = useNavigator();    

    const deviceTypeTest = "mobile";
    const orientationTest =  config.orientation;
    // const navigation = config.app.navigation[`${deviceType}${deviceType === "desktop" ? "" : orientation.charAt(0).toUpperCase() + orientation.slice(1)}`]
    const navigation = config.app.navigation.desktop;

    const isSidebarOpenedOnDesktop = useSelector(state => state.settings.isSidebarOpened);

    return (
        <div 
        // ${deviceType !== "desktop" && "hidden"}
        // bg-gradient-to-r from-primary-70 via-light-70 via-secondary-70 via-primary-70 to-light-70
        // dark:bg-gradient-to-r dark:from-primary-70 dark:via-dark-70 dark:via-secondary-70 dark:via-primary-70 dark:to-dark-70
            className={`
              absolute overflow-hidden top-0 bottom-0 
              ${navigation === "right-sidebar"
                ? (isSidebarOpenedOnDesktop ? "right-72 duration-300" : "right-18 duration-300")
                : "right-0"
              }
              ${navigation === "left-sidebar" 
                ? (isSidebarOpenedOnDesktop ? "left-72 duration-300" : "left-18 duration-300")
                : "left-0"
              }
            `}
            // TODO Automatiser les couleurs dark et light
            // style={{ backgroundImage: `linear-gradient(to right, rgb(${darkMode ? "var(--primary-color-rgb)" : "var(--secondary-color-rgb)"}, 0.7), rgb(${darkMode ? hexToRgb("#0f172a") : hexToRgb("#ffffff")}, 0.7), rgb(${darkMode ? "var(--secondary-color-rgb)" : "var(--primary-color-rgb)"}, 0.7), rgb(${darkMode ? "var(--primary-color-rgb)" : "var(--secondary-color-rgb)"}, 0.7), rgb(${hexToRgb(darkMode ? "#0f172a" : "#ffffff")}, 0.7))` }}
            style={{ backgroundImage: `linear-gradient(to right, rgb(var(--primary-color-rgb), 0.7), rgb(${darkMode ? hexToRgb("#0f172a") : hexToRgb("#ffffff")}, 0.7), rgb(var(--secondary-color-rgb), 0.7), rgb(var(--primary-color-rgb), 0.7), rgb(${darkMode ? hexToRgb("#0f172a") : hexToRgb("#ffffff")}, 0.7))` }}

        >
            <div className={`absolute blur-lg rounded-full bg-light dark:bg-dark left-0 top-30 h-120 w-120`} />
            <div className={`absolute blur-3xl rounded-full bg-secondary left-0 top-60 h-120 w-120`} />
            <div className={`absolute blur-3xl rounded-full bg-secondary right-0 bottom-0 h-120 w-120`} />
            <div className={`absolute blur-3xl rounded-full bg-primary-70 left-80 top-144 h-80 w-80`} />
            <div className={`absolute blur-3xl rounded-full bg-primary-70 left-30 top-50 h-60 w-60`} />
            <div className={`absolute blur-3xl rounded-full bg-primary-70 right-40 top-0 translate-x-1/2 h-100 w-100`} />
            <Outlet />
            <Sidebar config={config} />
        </div>
    );
};
