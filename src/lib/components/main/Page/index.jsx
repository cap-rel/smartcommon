import { useStates, useVariantMerger } from "../../../hooks";
import { navigatorInfo } from "../../../utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
// import { useLocation } from "react-router-dom";
import { defaultProps, propTypes } from "./props";
import { isEmpty } from "../../../utils";

const config = {
    pages: {
        "/": {
            "/dev2": "slideLeft",
            "*": "fade"
        },
        "/dev2": {
            "/": "slideRight",
            "*": "fade"
        },
        // "/": "fade",
        "*": "fade"
    }
};

const animations = {
    slideRight: {
        initial: { x: "50%", opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 0.15, ease: "easeInOut" } },
        exit: { x: "50%", opacity: 0, transition: { duration: 0.15, ease: "easeInOut" } },
    },
    slideLeft: {
        initial: { x: "-50%", opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 0.15, ease: "easeInOut" } },
        exit: { x: "-50%", opacity: 0, transition: { duration: 0.15, ease: "easeInOut" } },
    },
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.15, ease: "easeOut" } },
        exit: { opacity: 0, transition: { duration: 0.15, ease: "easeOut" }},
        // transition: { duration: 0.2, ease: "easeInOut" },
    },
    zoom : {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        transition: { duration: 0.2, ease: "easeOut" },
    }
};

let prevPathname = null;

export const Page = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Page", props);

    const { id, responsive = true, location, children } = variantProps;

    const device = navigatorInfo.device.type;

    const { pathname } = location ?? {}

    // const { pages } = useComponents() ?? {};

    const { pages } = config;

    useEffect(() => {
        prevPathname = pathname;
    }, [pathname]);

    const animation = () => {
        if (device?.type === "desktop") {
            return "fade";
        }

        const page = pages[pathname];
        if (page) {
            if (typeof page === "string") {
                return page
            } else {
                const prevPage = page[prevPathname];
                if (prevPage) {
                    return prevPage;
                } else {
                    return page["*"];
                }
            }
            } else {
            const page = pages["*"];
            if (typeof page === "string") {
                return page
            } else {
                const prevPage = page[prevPathname];
                if (prevPage) {
                    return prevPage;
                } else {
                    return page["*"];
                }
            }
        }
    };

//     const animation = () => {
//     const page = pages[pathname];
//     if (page) {
//       if (typeof page === "string") return page;
//       return page[prevPathname] || page["*"];
//     } else {
//       const page = pages["*"];
//       if (typeof page === "string") return page;
//       return page[prevPathname] || page["*"];
//     }
//   };

    const pageRef = useRef(null);

    const { states, set } = useStates({
        tabbarHeight: 0,
        tabbarWidth: 0
    });

    const { tabbarHeight, tabbarWidth } = states;

    useEffect(() => {
        const tabbar = pageRef?.current?.querySelector("[data-component='Tabbar']");
        set("tabbarHeight", tabbar?.offsetHeight);
        set("tabbarWidth", tabbar?.offsetWidth);
    }, []);

    // pb-(--test-tabbar-height) lg:mb-0 lg:ml-(--test-tabbar-width)

    return (
        <motion.div { ...mergeProps("page", props => ({
            ...props,
            "data-component": "Page",
            key: pathname,
            ref: pageRef,
            style: { 
                "--page-tabbar-height": `${tabbarHeight}px`,
                "--page-tabbar-width": `${tabbarWidth}px`
            },
            className: `
                text-strong-text text-app-sm fixed inset-0 overflow-y-auto bg-medium-bg
                ${tabbarHeight > 0 && "pb-(--page-tabbar-height)"}
                ${responsive && `
                    lg:px-20 lg:py-app-xl
                    ${tabbarWidth > 0 && "lg:left-(--page-tabbar-width)"}
                    xl:px-30
                `}
            `,
            ...animations[animation()]
        }))}>
            <div {...mergeProps("content", props => ({
                ...props,
                className: `
                    lg:max-w-[1024px] lg:mx-auto lg:grid lg:grid-cols-2 lg:gap-app-base
                `
            }))}>
                {children}
            </div>
        </motion.div>
    );
};

Page.propTypes = propTypes;
Page.defaultProps = defaultProps;