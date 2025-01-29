/*
 * KonstaToast/index.jsx
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

import { Icon, Notification } from "konsta/react";
import { removeToast } from "../../../../../reduxStore/reducers/toastsSlice";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { MdError } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";

const KonstaToast = (props) => {
  const dispatch = useDispatch();
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    setDisplay(true)
    if (props.toast.auto) {
      setTimeout(() => {
        dispatch(removeToast(props.toast.id));
      }, props.toast.delay || 6000);
    }
  }, []);

  return (
    <Notification
      opened={display}
      icon={
        props.toast.status === "error" ? (
          <Icon
            ios={<MdError />}
            material={<MdError />}
            className="text-lost text-2xl"
          />
        ) : props.toast.status === "success" ? (
          <Icon
            ios={<FaCircleCheck />}
            material={<FaCircleCheck />}
            className="text-open text-2xl"
          />
        ) : (
          props.toast.icon || ""
        )
      }
      title={
        <span className={`${props.error && "text-lost"}`}>
          {props.toast.title || ""}
        </span>
      }
      titleRightText={props.toast.right || ""}
      subtitle={props.toast.subtitle || ""}
      text={props.toast.text || ""}
      onClick={props.toast.closeOnClick && (() => dispatch(removeToast(props.toast.id)))}
      button={props.toast.closeOnClick}
      className={`${!display && "-translate-y-full"} duration-300`}
    />
  );
};

export default KonstaToast;
