import { useEffect, useState } from "react";
import { isEmpty, sortArray } from "../../../globals/functions";
import { useLocation } from "react-router-dom";
import { useNavigator, useStates, useWindow } from "../../../hooks";
import { LazyLink } from "../../others";
import { Button, Overlay } from "../../others";
import { IoCloseSharp, IoMenuSharp } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { propTypes } from "./props";

export const Sidebar = ({
  position = "left",
  overlayProps,
  sidebarProps,
  buttonProps,
  ...props
}) => {
  const sidebarPs = { ...props, ...sidebarProps };

  const { children } = sidebarPs;

  const { states, set } = useStates({
    isOpen: true,
    clickedLink: false,
  });

  const { isOpen, clickedLink } = states;

  // useEffect(() => {
  //   if (states.isOpen) {
  //     set("isNotOpened", false);
  //   } else {
  //     setTimeout(() => {
  //       set("isNotOpened", true);
  //     }, 300);
  //   }
  // }, [states.isOpen]);

  // useEffect(() => {
  //   if (clickedLink) {
  //     setTimeout(() => {
  //       set("clickedLink", false);
  //     }, 300);
  //   }
  // }, [clickedLink]);

  let positionClass = `${isOpen ? "left-0 " : "-left-32"}`;

  if (position === "right") {
    positionClass = `${isOpen ? "right-0" : "-right-32"}`;
  }

  return (
    <>
      <Overlay
        { ...overlayProps}
        isOpen={isOpen}
        closeOverlay={() => set("isOpen", false)}
      />
      <div
        { ...sidebarPs}
        style={{ "--transitionDuration": "300ms", ...sidebarPs?.style }}
        className={twMerge(`fixed top-0 bottom-0 z-50 py-4 w-32 duration-(--transitionDuration) bg-strong ${positionClass}`, sidebarPs?.className)}
      >
        {children}
        <Button 
          left={isOpen ? <IoCloseSharp /> : <IoMenuSharp />}
          { ...buttonProps}
          onClick={() => set("isOpen", !isOpen)}
          // className={twMerge(`z-50 absolute bottom-4 shadow-md rounded-none rounded-r-md ${position === "right" ? "-left-10" : "-right-10"}`, buttonProps?.className)}
          className={twMerge(`z-50 absolute bottom-4 shadow-md rounded-full ${position === "right" ? "-left-14" : "-right-15"}`, buttonProps?.className)}
          leftProps={{ className: "text-3xl" }}
        />
      </div>
    </>
  );
};

Sidebar.propTypes = propTypes;