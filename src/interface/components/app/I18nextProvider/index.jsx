/*
 * I18nextProvider
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

import { I18nextProvider as Provider } from "react-i18next";
import { useEffect } from "react";
import { i18n } from "../../../i18n";
import { useSelector } from "react-redux";

export const I18nextProvider = (props) => {
  const { children } = props;

  // const reduxSettings = useSelector(state => state.settings.data) ?? {};
  // const { lng: reduxLng } = reduxSettings;

  // const lng = reduxLng ?? localStorage.getItem("lng") ?? "en";

  const lng = "en";

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng]);

  return (
    <Provider i18n={i18n}>
      {children}
    </Provider>
  );
};