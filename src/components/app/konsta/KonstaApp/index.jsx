/*
 * KonstaApp/index.jsx
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

import { App } from "konsta/react";
import KonstaToast from "./KonstaToast";
import { useSelector } from "react-redux";

const KonstaApp = (props) => {
  const toasts = useSelector((state) => state.toasts.list);

  return (
    <App
      theme="ios"
      // theme={
      //   /iPhone|iPad|iPod|Mac OS/i.test(navigator.userAgent)
      //     ? "ios"
      //     : "material"
      // }
    >
      {props.children}
      {toasts.map((toast, toastIndex) => (
        <KonstaToast key={toastIndex} toast={toast} />
      ))}
    </App>
  );
};

export default KonstaApp;
