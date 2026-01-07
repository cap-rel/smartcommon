import { animate, useMotionValue, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { isEmpty } from "lodash";

import { useStates, useVariantMerger } from "lib/hooks";
import { setGlobalVariables, navigatorInfo } from "lib/utils";

import { defaultProps, propTypes } from "./props";

// TODO when there is not left or right, adjust the justify-between

export const Navbar = (props) => {
    const { variantProps, mergeProps, setParams } = useVariantMerger("Navbar", props);

    const { 
        id,
        responsive = true,
        hideOnScroll = true,
        children,
        left,
        right,
        bottom,
        title,
    } = variantProps;

    // useEffect(() => {
    //     setParams()
    // }, [isA])

    const navbarRef = useRef();
    const upperNavbarRef = useRef();

    const initialStates = {
        navbarHeight: 0,
        navbarWidth: 0,
        upperNavbarHeight: 0,
        upperNavbarWidth: 0
    };

    const { states, set } = useStates({ initialStates, debug: false });

    const { navbarHeight, navbarWidth, upperNavbarHeight, upperNavbarWidth } = states;

    useEffect(() => {
        if (navbarRef.current) {
            set("navbarHeight", navbarRef.current.offsetHeight);
            set("navbarWidth", navbarRef.current.offsetWidth);
        }
        if (upperNavbarRef.current) {
            set("upperNavbarHeight", upperNavbarRef.current.offsetHeight);
            set("upperNavbarWidth", upperNavbarRef.current.offsetWidth);
        }
    }, []);

    const variables = {
        "--navbar-height": `${navbarHeight}px`,
        "--navbar-width": `${navbarWidth}px`,
        "--upper-navbar-height": `${upperNavbarHeight}px`,
        "--upper-navbar-width": `${upperNavbarWidth}px`
    };

    useEffect(() => {
        setGlobalVariables(id, variables);
        // setParams
    }, [navbarHeight, navbarWidth, upperNavbarHeight, upperNavbarWidth]);

    // useEffect(() => {
    //     setParams({ navbarHeight, navbarWidth });
    // }, [navbarHeight, navbarWidth]);

    const isLeftEmpty = isEmpty(left);
    const isRightEmpty = isEmpty(right);
    const isBottomEmpty = isEmpty(bottom);

    const [isOpen, setIsOpen] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const duration = 0.1;
    const openGoBackValue = 1/5;
    const closedGoBackValue = 4/5;

    const openPosition = 0;
    const closedPosition = -navbarHeight || -window.innerHeight;

    const tabbarPosition = isOpen ? openPosition : closedPosition;

    const y = useMotionValue(openPosition);

    const isDesktop = navigatorInfo.device.type === "desktop";

    useEffect(() => {
        if (!hideOnScroll || isDesktop) { return; }

        const scrollElement = navbarRef.current?.closest("[data-component='Page']");
        // const scrollElement = window;

        const handleScroll = () => {
            const currentY = scrollElement.scrollTop;

            const delta = currentY - lastScrollY;

            const currentPosition = Math.max(closedPosition, Math.min(openPosition, y.get() - delta));

            y.set(currentPosition);

            setLastScrollY(currentY);
        };

        const handleScrollEnd = () => {
            if (isOpen) {
                if (y.get() < -navbarHeight * openGoBackValue) {
                    setIsOpen(false);
                } else {
                    animate(y, openPosition, { duration });
                }
            } else {
                if (y.get() < -navbarHeight * closedGoBackValue) {
                    animate(y, closedPosition, { duration });
                } else {
                    setIsOpen(true);
                }
            }
        
        };

        if (scrollElement) {
            scrollElement.addEventListener("scroll", handleScroll, { passive: true });
            scrollElement.addEventListener("touchend", handleScrollEnd);
            scrollElement.addEventListener("mouseup", handleScrollEnd);

            return () => {
                scrollElement.removeEventListener("scroll", handleScroll);
                scrollElement.removeEventListener("touchend", handleScrollEnd);
                scrollElement.removeEventListener("mouseup", handleScrollEnd);
            };
        }

    }, [lastScrollY]);

    useEffect(() => {
        if (!hideOnScroll || isDesktop) { return; }
        animate(y, tabbarPosition, { duration });
    }, [isOpen]);

    return (
        <motion.div { ...mergeProps("navbar", props => ({
            ...props,
            "data-component": "Navbar",
            ref: navbarRef,
            style: {
                y,
                ...variables
            },
            className: `
                sticky top-0 z-20 text-app-md flex flex-col bg-primary rounded-b-app-base shadow-md
                lg:relative lg:flex-row lg:text-strong-text lg:bg-transparent lg:shadow-none lg:justify-between lg:items-center lg:col-span-full
            `
        }))}>     

            <div { ...mergeProps("upperNavbar", props => ({
                ...props,
                ref: upperNavbarRef,
                className: `
                    p-app-base flex justify-between items-center
                    ${isBottomEmpty ? "rounded-b-app-base" : "rounded-b-none"}
                `
            }))}>

                {!isLeftEmpty &&
                    <div { ...mergeProps("leftContainer", props => ({
                        ...props,
                        className: `flex gap-app-xs -ml-app-xs`
                        // min-w-9
                    }))}>
                        {left}
                    </div>
                }

                {title && 
                    <div { ...mergeProps("title", props => ({
                        ...props,
                        className: `
                            grow truncate text-white font-app-semibold text-app-md
                            ${isLeftEmpty ? "text-left" : isRightEmpty ? "text-right" : "text-center"}
                            lg:text-strong-text lg:text-app-2xl
                        `
                    }))}>
                        {title}
                    </div>
                }
            
                {!isRightEmpty &&
                    <div { ...mergeProps("rightContainer", props => ({
                        ...props,
                        className: `flex gap-app-xs -mr-app-xs`
                        // min-w-9
                    }))}>
                        {right}
                    </div>
                }
            </div>

            {bottom &&
                <div { ...mergeProps("bottomContainer", props => ({
                    ...props,
                    className: `
                        snap-x flex items-center bg-primary text-app-base overflow-x-auto
                        lg:bg-transparent
                    `
                }))}>
                    {bottom}
                </div>
            }

            {children}

        </motion.div>
    );
};

Navbar.propTypes = propTypes;
Navbar.propTypes = defaultProps;