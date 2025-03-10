import { useEffect, useState } from "react";
import { isEmpty, sortArray } from "../../../globals/functions";
import { useLocation } from "react-router-dom";
import { useNavigator, useStates, useWindow } from "../../../hooks";
import { LazyLink } from "../../others";
import { Button, Overlay } from "../../others";

export const Sidebar = ({
  position = "left",
  children = null,
  variant = "",
  customType = null,
  custom = {
    colors: null,
    classNames: null
  }
}) => {
  const { states, set } = useStates({
    isOpened: true,
    clickedLink: false,
  });

  const { isOpened, clickedLink } = states;

  // useEffect(() => {
  //   if (states.isOpened) {
  //     set("isNotOpened", false);
  //   } else {
  //     setTimeout(() => {
  //       set("isNotOpened", true);
  //     }, 300);
  //   }
  // }, [states.isOpened]);

  // useEffect(() => {
  //   if (clickedLink) {
  //     setTimeout(() => {
  //       set("clickedLink", false);
  //     }, 300);
  //   }
  // }, [clickedLink]);

  let positionClass = `left-0 ${isOpened ? "translate-x-0" : "-translate-x-full"}`;

  if (position === "right") {
    positionClass = `right-0 ${isOpened ? "translate-x-0" : "translate-x-full"}`;
  }

  return (
    <>
      <Overlay isVisible={isOpened} />
      <div 
        style={{ "--transitionDuration": transitionDuration }}
        className={`fixed top-0 bottom-0 z-30 py-4 duration-(--transitionDuration) bg-strong ${positionClass}`}
      >
        {children}
        <Button 
          leftIcon={{
            library: isOpened ? "io5" : "io5",
            name: isOpened ? "IoCloseSharp" : "IoMenuSharp"
          }}
          onClick={() => set("isOpened", !isOpened)}
          variant={{
            classNames: {
              button: `z-50 absolute bottom-4 shadow-md rounded-full ${position === "right" ? "-left-11" : "-right-15"}`
            }
          }}
        />
      </div>
    </>
  );
};
