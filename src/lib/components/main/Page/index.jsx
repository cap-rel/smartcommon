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

    // Pin the fixed scroller to the visual viewport on mobile, but ONLY while
    // the virtual keyboard is open. On iOS the visualViewport "scroll" event
    // fires continuously during normal scroll / rubber-band and `viewport.height`
    // fluctuates with the URL-bar collapse; writing height (and top) on every
    // such event resized the scroller mid-gesture, which made scrolling feel
    // inverted / random, and the height/top desync left a grey body band under
    // the scroller. So we detect the keyboard (visual viewport shrunk past a
    // threshold WITHOUT the layout viewport shrinking) and only then pin both
    // height and top together, in a single handler. Otherwise we clear both
    // inline overrides and let the CSS `h-dvh` / `top-0` govern: zero writes
    // during normal scroll, so no jank and no grey band.
    useEffect(() => {
        if (isDesktop) return;

        const viewport = window.visualViewport;
        if (!viewport) return;

        // 150px clears the URL-bar collapse (~60-110px); a virtual keyboard is
        // 250px+. With `resizes-content` the layout viewport shrinks too, the
        // diff stays ~0 and we leave the scroller to the CSS (browser already
        // resized it).
        const KEYBOARD_THRESHOLD = 150;

        const handleViewport = () => {
            if (!pageRef.current) return;
            const keyboardOpen = window.innerHeight - viewport.height > KEYBOARD_THRESHOLD;
            if (keyboardOpen) {
                pageRef.current.style.height = `${viewport.height}px`;
                pageRef.current.style.top = `${viewport.offsetTop}px`;
            } else {
                pageRef.current.style.height = "";
                pageRef.current.style.top = "";
            }
        };

        viewport.addEventListener("resize", handleViewport);
        viewport.addEventListener("scroll", handleViewport);
        handleViewport();

        return () => {
            viewport.removeEventListener("resize", handleViewport);
            viewport.removeEventListener("scroll", handleViewport);
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