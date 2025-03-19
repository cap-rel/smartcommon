import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStates, useWindow } from "../../../hooks";
import { Button } from "../../others";
import { SearchBar } from "../../list";
import { isEmpty, isNil } from "../../../globals/functions";
import { twMerge } from "tailwind-merge";
import { Link, useLocation } from "react-router-dom";

export const Navbar = ({
    title,
    left,
    right,
    links = [],
}) => {
    const y = 1

    const { states, set } = useStates({
        isSearchBarVisible: true,
        test: 1,
    });

    const { isSearchBarVisible, test } = states;
   
    return (
        <>
        {/* <SearchBar isVisible={isSearchBarVisible} setVisibility={value => set("isSearchBarVisible", value)}/> */}
        <div
            // style={{ "--opacity": `${y > 48 ? 100 : y * (100 / 48)}%`, "--title-padding": `${48 - y}px`, "--font-size": `${y > 48 ? 18 : 30 - y * (12 / 48)}px` }}
            className={`sticky top-0 z-20 text-lg col ${y > 0 ? "bg-primary" : "bg-soft"} duration-200 ${y > 0 && ""}`}
        >
            <div className={`relative px-4 py-2 row-between-center`}>
                <div className={`row-v-center flex-1`}>
                    {left?.map((icon, II) =>
                        <Button
                            key={`icon${II}`}
                            left={icon.icon}
                            { ...icon}
                            className={twMerge(`${y > 0 ? "bg-primary" : "bg-soft"} transition duration-200 text-white rounded-full first:-ml-2`, icon?.className)}
                        />
                    )}
                </div>

                {!isNil(title) && 
                    <div className={`text-white font-semibold ${y > 0 ? "opacity-100 text-lg" : "opacity-0 text-[0px]"} transition-all duration-200`}>
                        {title}
                    </div>
                }
            
                <div className={`row-v-center flex-1 justify-end`}>
                    {right?.map((icon, II) =>
                        <Button
                            key={`icon${II}`}
                            left={icon.icon}
                            { ...icon}
                            className={twMerge(`${y > 0 ? "bg-primary" : "bg-soft"} transition duration-200 text-white rounded-full last:-mr-2`, icon?.className)}
                        />
                    )}
                </div>
            </div>
            <div className={`font-semibold ${y > 0 ? "opacity-0 text-[0px] p-0" : "opacity-100 text-3xl px-4 py-2"} transition-all duration-200`}>
                {title}
            </div>
            {!isEmpty(links) &&
                <div className={`bg-soft relative text-base`}>
                    {/* <div 
                        style={{ backgroundImage: `linear-gradient(to right, var(--color-primary), transparent 5%, transparent 95%, var(--color-primary))` }}
                        className={`absolute inset-0 pointer-events-none z-30`} 
                    /> */}
                    <div className={`bg-primary absolute left-0 right-0 top-0 bottom-1/2 z-10`}/>
                    <div className={`overflow-x-auto row-v-center relative z-20 scroll-hidden`}>
                        {links.map((link, LI) => {
                            return (
                                <Link
                                    key={`link${LI}`}
                                    { ...link}
                                    onClick={() => set("test", LI)}
                                    className={twMerge(`duration-100 active:brightness-soft row-v-center gap-2 ${test == LI ? "bg-soft text-primary rounded-t-xl first:rounded-tl-none last:rounded-tr-none" : "text-white bg-primary"} px-4 py-2 ${LI == test - 1 && "rounded-br-xl"} ${LI == test + 1 && "rounded-bl-xl"}`)}
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
                </div>
            }
        </div>
        </>
    );
};