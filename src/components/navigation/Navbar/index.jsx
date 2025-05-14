import { useStates, useVariantToProps } from "../../../hooks";
import { isNil, setVariable } from "../../../globals/functions";
import { propTypes } from "./props";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

// TODO when there is not left or right, adjust the justify-between

export const Navbar = (props) => {
    const { variantProps, mergeProps, setParams } = useVariantToProps("navbar", props);

    const { id, children, leftLinks, rightLinks, bottomLinks, title } = variantProps;

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
        [`--navbar-width`]: `${navbarWidth}px`
    };

    useEffect(() => {
        setVariable(`--${id}-upper-navbar-height`, `${upperNavbarHeight}px`);
        setVariable(`--${id}-upper-navbar-width`, `${upperNavbarWidth}px`);

        setVariable(`--${id}-navbar-height`, `${navbarHeight}px`);
        setVariable(`--${id}-navbar-width`, `${navbarWidth}px`);
    }, [navbarHeight, navbarWidth, upperNavbarHeight, upperNavbarWidth]);

    // useEffect(() => {
    //     setParams({ navbarHeight, navbarWidth });
    // }, [navbarHeight, navbarWidth]);

    return (
        <div { ...mergeProps("navbar", props => ({
            ...props,
            ref: navbarRef,
            className: `sticky top-0 z-20 text-app-md flex flex-col bg-primary rounded-b-app-base shadow-md`
        }))}>     

            <div { ...mergeProps("upperNavbar", props => ({
                ...props,
                ref: upperNavbarRef,
                className: `p-app-xs flex justify-between items-center ${!isNil(bottomLinks) ? "rounded-b-none" :  "rounded-b-app-base"}`
            }))}>

            {!isNil(leftLinks) &&
                <div { ...mergeProps("leftLinks", props => ({
                    ...props,
                    className: `flex gap-app-xs min-w-9`
                }))}>
                    
                    {leftLinks?.map((link, LI) => {
                        const { icon, disabled, label } = link;
                                                            
                        return (
                            <Link key={`link${LI}`} { ...mergeProps("leftLink", props => ({
                                ...props,
                                ...link,
                                className: `flex items-center gap-app-xs bg-primary text-white px-app-xs py-app-xs text-app-lg rounded-app-xl active:brightness-soft ${disabled && "pointer-events-none"}`
                            }))}>
                    
                                {!isNil(icon) && 
                                    <div { ...mergeProps("leftIcon", props => props)}>
                                        {icon}
                                    </div>
                                }
                
                                {!isNil(label) &&
                                    <div { ...mergeProps("leftLabel", props => props)}>
                                        {label}
                                    </div>
                                }
                
                            </Link>
                        );
                    })}

                </div>
            }

                {!isNil(title) && 
                    <div { ...mergeProps("title", props => ({
                        ...props,
                        className: `truncate text-white font-app-semibold text-app-md py-app-xs`
                    }))}>
                        {title}
                    </div>
                }
            
                {!isNil(leftLinks) &&

                    <div { ...mergeProps("rightLinks", props => ({
                        ...props,
                        className: `flex gap-app-xs min-w-9`
                    }))}>
                        
                        {rightLinks?.map((link, LI) => {
                            const { icon, disabled, label } = link;
                                                                
                            return (
                                <Link key={`link${LI}`} { ...mergeProps("rightLink", props => ({
                                    ...props,
                                    ...link,
                                    className: `bg-primary text-white px-app-xs py-app-xs text-app-lg rounded-app-xl active:brightness-soft ${disabled && "pointer-events-none"}`
                                }))}>
                    
                                    {!isNil(label) &&
                                        <div { ...mergeProps("rightLabel", props => props)}>
                                            {label}
                                        </div>
                                    }

                                    {!isNil(icon) && 
                                        <div { ...mergeProps("rightIcon", props => props)}>
                                            {icon}
                                        </div>
                                    }
                    
                                </Link>
                            );

                        })}

                    </div>
                }

                {children}

            </div>

            {!isNil(bottomLinks) &&
                <div { ...mergeProps("bottomLinks", props => ({
                    ...props,
                    className: `snap-x flex items-center bg-primary text-app-base overflow-x-auto`
                }))}>
                    
                    {bottomLinks.map((link, LI) => {
                        const { to, icon, activeIcon, disabled, label, active: isActiveManually } = link;
                                            
                        const isActive = !isNil(isActiveManually) ? isActiveManually : `${location.pathname}${location.search}` === to;
                        const currentIcon = isActive ? (!isNil(activeIcon) ? activeIcon : icon) : icon;
                
                        return (
                            <Link key={`link${LI}`} { ...mergeProps("bottomLink", props => ({
                                ...props,
                                ...link,
                                style: { transition: `filter var(--really-quick), color var(--medium), border-color var(--medium)` },
                                className: `bg-primary text-app-sm snap-center px-app-base py-app-xs border-b-4
                                font-app-base flex-1 ${disabled && "pointer-events-none"} whitespace-nowrap rounded-app-base border-primary
                                ${isActive ? "text-white border-white font-app-semibold" : "font-app-base text-soft-text border-primary active:brightness-soft"}
                                flex justify-center items-center gap-app-xs`
                            }))}>
                                {/* border-b-4 */}
                    
                                {!isNil(icon) && 
                                    <div { ...mergeProps("bottomIcon", props => props)}>
                                        {currentIcon}
                                    </div>
                                }
                
                                {!isNil(label) &&
                                    <div { ...mergeProps("bottomLabel", props => props)}>
                                        {label}
                                    </div>
                                }
                                    
                            </Link>
                        );

                    })}

                </div>
            }

        </div>
    );
};

Navbar.propTypes = propTypes;

{/* <Button { ...mergeProps("RightButton", props => ({
                                ...props,
                                icon: rightButtons.icon,
                                buttonProps: {
                                    ...props.buttonProps,
                                    className: "px-app-xs py-app-xs text-app-lg"
                                }
                            }))} /> */}

{/* <Button key={`link${LI}`} { ...mergeProps("BottomButton", props => ({
    ...props,
    ...link,
    buttonProps: {
        ...props.buttonProps,
        onClick: () => set("linkActive", LI),
        style: { transition: `filter var(--really-quick), color var(--medium), border-color var(--medium)` },
        className: `snap-center border-b-4 px-app-base py-app-xs rounded-note rounded-b-app-base font-app-base gap-app-sm ${linkActive == LI ? "text-white border-white" : "text-white/50 border-primary"}`
    }
}))} /> */}


// Link Rounded Variant ?

{/* <div className={`bg-soft relative text-base`}>
                    <div className={`bg-primary absolute left-0 right-0 top-0 bottom-1/2 z-10`}/>
                    <div className={`overflow-x-auto row-v-center relative z-20 scroll-hidden`}>
                        {links.map((link, LI) => {
                            return (
                                <Link
                                    key={`link${LI}`}
                                    { ...link}
                                    onClick={() => set("linkActive", LI)}
                                    className={twMerge(`duration-100 active:brightness-soft row-v-center gap-2 ${linkActive == LI ? "bg-soft text-primary rounded-t-xl first:rounded-tl-none last:rounded-tr-none" : "text-white bg-primary"} px-4 py-2 ${LI == linkActive - 1 && "rounded-br-xl"} ${LI == linkActive + 1 && "rounded-bl-xl"}`)}
                                >
                                    <div
                                        className={twMerge(`text-lg`)}
                                    >
                                        {link.icon}
                                    </div>
                                    <div
                                        className={twMerge(`whitespace-nowrap`)}
                                    >
                                        {link.label}
                                    </div>
                                </Link>
                            );
                        }
                        )}
                    </div>
                </div> */}