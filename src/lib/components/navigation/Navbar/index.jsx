import { useStates, useVariantMerger } from "../../../hooks";
import { isNil, setGlobalVariables, setVariable } from "../../../utils";
import { defaultProps, propTypes } from "./props";
// import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

// TODO when there is not left or right, adjust the justify-between

export const Navbar = (props) => {
    const { variantProps, mergeProps, setParams } = useVariantMerger("Navbar", props);

    const { id, children, upperLeftLinks, upperRightLinks, lowerLinks, title } = variantProps;

    // useEffect(() => {
    //     setParams()
    // }, [isA])

    const navbarRef = useRef();
    const upperNavbarRef = useRef();

    const { states, set } = useStates({
        navbarHeight: 0,
        navbarWidth: 0,
        upperNavbarHeight: 0,
        upperNavbarWidth: 0
    });

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

    const globalVariables = {
        [`--${id}-navbar-height`]: `${navbarHeight}px`,
        [`--${id}-navbar-width`]: `${navbarWidth}px`
    };

    const variables = {
        [`--navbar-height`]: `${navbarHeight}px`,
        [`--navbar-width`]: `${navbarWidth}px`,
        [`--upper-navbar-height`]: `${upperNavbarHeight}px`,
        [`--upper-navbar-width`]: `${upperNavbarWidth}px`
    };

    useEffect(() => {
        setGlobalVariables(id, variables);
        // setParams
    }, [navbarHeight, navbarWidth, upperNavbarHeight, upperNavbarWidth]);

    // useEffect(() => {
    //     setParams({ navbarHeight, navbarWidth });
    // }, [navbarHeight, navbarWidth]);

    return (
        <div { ...mergeProps("navbar", props => ({
            ...props,
            ref: navbarRef,
            style: { ...variables },
            className: `sticky top-0 z-20 text-app-md flex flex-col bg-primary rounded-b-app-base shadow-md`
        }))}>     

            <div { ...mergeProps("upperNavbar", props => ({
                ...props,
                ref: upperNavbarRef,
                className: `p-app-xs flex justify-between items-center ${!isNil(lowerLinks) ? "rounded-b-none" :  "rounded-b-app-base"}`
            }))}>

                {!isNil(upperLeftLinks) &&
                    <div { ...mergeProps("upperLeftLinks", props => ({
                        ...props,
                        className: `flex gap-app-xs min-w-9`
                    }))}>
                        {upperLeftLinks}
                    </div>
                }

                {!isNil(title) && 
                    <div { ...mergeProps("title", props => ({
                        ...props,
                        className: `text-center truncate text-white font-app-semibold text-app-md py-app-xs`
                    }))}>
                        {title}
                    </div>
                }
            
                {!isNil(upperRightLinks) &&
                    <div { ...mergeProps("upperRightLinks", props => ({
                        ...props,
                        className: `flex gap-app-xs min-w-9`
                    }))}>
                        {upperRightLinks}
                    </div>
                }
            </div>

            {!isNil(lowerLinks) &&
                <div { ...mergeProps("lowerLinks", props => ({
                    ...props,
                    className: `snap-x flex items-center bg-primary text-app-base overflow-x-auto`
                }))}>
                    {lowerLinks}
                </div>
            }

        </div>
    );
};

Navbar.propTypes = propTypes;
Navbar.propTypes = defaultProps;