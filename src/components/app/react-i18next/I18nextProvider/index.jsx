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
import { i18n } from "../../../../i18n";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export const I18nextProvider = (props) => {
  const language = useSelector((state) => state.settings.language);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return <Provider i18n={i18n}>{props.children}</Provider>;
};