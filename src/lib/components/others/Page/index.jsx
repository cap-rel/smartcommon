import { useNavigator, useVariantMerger } from "../../../hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const config = {
    animations: {
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
    },
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

let prevPathname = null;

export const Page = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Page", props);

    const { children } = variantProps;

    const { device } = useNavigator(true) ?? {};

    const location = useLocation();
    const { pathname } = location ?? {}

    useEffect(() => {
        prevPathname = location.pathname;
    }, [location.pathname]);

    const { animations = {}, pages = {} } = config ?? {};

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

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname} // important pour déclencher l'animation au changement de route
                className="fixed inset-0"
                { ...animations[animation()]}
            >
                <div { ...mergeProps("page", props => ({
                    ...props,
                    className: `fixed inset-0 bg-medium-bg overflow-y-auto text-strong-text text-app-sm`
                }))}>
                    {children}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};