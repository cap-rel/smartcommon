import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { useLibConfig, useStates, useVariantMerger, useIsDesktop } from "lib/hooks";
import { log, navigatorInfo } from "lib/utils";

import { defaultProps, propTypes } from "./props";

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

    const libConfig = useLibConfig();
    const isDesktop = useIsDesktop();

    const { debug } = libConfig;

    const componentId = id || `${id}Page`;

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

    const initialStates = {
        tabbarHeight: 0,
        tabbarWidth: 0
    };

    const { states, set } = useStates({ initialStates, debug: false });

    const { tabbarHeight, tabbarWidth } = states;

    useEffect(() => {
        if (debug) {
            log.page(componentId);
        }
        const tabbar = pageRef?.current?.querySelector("[data-component='Tabbar']");
        set("tabbarHeight", tabbar?.offsetHeight);
        set("tabbarWidth", tabbar?.offsetWidth);
    }, []);

    // Adjust height to visual viewport on mobile when virtual keyboard opens
    useEffect(() => {
        if (isDesktop) return;

        const viewport = window.visualViewport;
        if (!viewport) return;

        const handleResize = () => {
            if (!pageRef.current) return;
            pageRef.current.style.height = `${viewport.height}px`;
            // Only follow the visual-viewport offset while it is meaningfully
            // shifted (iOS keyboard pan). Otherwise clear it so the CSS `top-0`
            // governs: writing `top: <offsetTop>px` on the fixed scroller on
            // every visualViewport "scroll" event dragged the layer during
            // normal scroll / rubber-band and made iOS scrolling feel inverted.
            pageRef.current.style.top = viewport.offsetTop > 1 ? `${viewport.offsetTop}px` : "";
        };

        viewport.addEventListener("resize", handleResize);
        viewport.addEventListener("scroll", handleResize);
        handleResize();

        return () => {
            viewport.removeEventListener("resize", handleResize);
            viewport.removeEventListener("scroll", handleResize);
            // Drop the inline overrides so a stale keyboard height/offset never
            // survives a navigation (it otherwise left the next page offset).
            if (pageRef.current) {
                pageRef.current.style.height = "";
                pageRef.current.style.top = "";
            }
        };
    }, [isDesktop]);

    // pb-(--test-tabbar-height) lg:mb-0 lg:ml-(--test-tabbar-width)

    return (
        <motion.div key={pathname} { ...mergeProps("page", props => ({
            ...props,
            "data-component": "Page",
            ref: pageRef,
            style: { 
                "--page-tabbar-height": `${tabbarHeight}px`,
                "--page-tabbar-width": `${tabbarWidth}px`
            },
            className: `
                text-strong-text text-app-sm overflow-y-auto bg-medium-bg
                ${isDesktop ? "min-h-screen" : "fixed inset-x-0 top-0 h-dvh"}
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