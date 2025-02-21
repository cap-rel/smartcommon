import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStates, useWindow } from "../../../hooks";
import { Button } from "../../others";
import { SearchBar } from "../../list";

export const Navbar = ({
    title = null,
    left = null,
    center = null,
    right = null,
    bottom = null,
    // list = {},
    // searchBar = {},
    // filter = {},
    // options = {},
    // backTo = null,
    // sidebar = null,
}) => {
    const { scroll } = useWindow();
    const { y } = scroll;

    const { states, set } = useStates({
        isSearchBarVisible: true,
    });

    const { isSearchBarVisible } = states;
   
    return (
        <>
        <SearchBar isVisible={isSearchBarVisible} setVisibility={value => set("isSearchBarVisible", value)}/>
        <div
            // style={{ "--opacity": `${y > 48 ? 100 : y * (100 / 48)}%`, "--title-padding": `${48 - y}px`, "--font-size": `${y > 48 ? 18 : 30 - y * (12 / 48)}px` }}
            className={`sticky top-0 z-20 text-lg col ${y > 0 ? "bg-strong" : "bg-soft"} duration-200 ${y > 0 && "shadow-md"}`}
        >
            <div className={`relative px-4 pt-2 pb-4 row-between-center`}>
                <div className={`gap-3 row-v-center`}>
                    <Button
                        leftIcon={{
                            library: "fa6",
                            name: "FaBars"
                        }}
                        variant={{
                            classNames: {
                                button: `${y > 0 ? "bg-strong" : "bg-soft"} transition duration-200 text-strong-text -ml-3 rounded-full p-3`
                            }
                        }}
                    />
                    {/* <div className={`font-semibold ${y > 0 ? "pt-0 text-xl" : "pt-12 text-3xl"} transition-all duration-100`}>
                        {title}
                    </div> */}
                     <div className={`font-semibold ${y > 0 ? "opacity-100 text-lg" : "opacity-0 text-[0px]"} transition-all duration-200`}>
                        {title}
                    </div>
                </div>
                
                <div className={`gap-1 row-v-center`}>
                    <Button
                        leftIcon={{
                            library: "fa6",
                            name: "FaMagnifyingGlass"
                        }}
                        variant={{
                            classNames: {
                                button: `${y > 0 ? "bg-strong" : "bg-soft"} transition duration-200 text-strong-text rounded-full p-3`
                            }
                        }}
                        onClick={() => set("isSearchBarVisible", true)}
                    />
                      <Button
                        leftIcon={{
                            library: "fa6",
                            name: "FaEllipsis"
                        }}
                        variant={{
                            classNames: {
                                button: `${y > 0 ? "bg-strong" : "bg-soft"} transition duration-200 text-strong-text -mr-3 rounded-full p-3`
                            }
                        }}
                    />
                </div>
            </div>
            <div className={`font-semibold ${y > 0 ? "opacity-0 text-[0px] p-0" : "opacity-100 text-3xl px-4 py-2"} transition-all duration-200`}>
                {title}
            </div>
            <div className={`overflow-x-auto gap-4 py-4 row-v-center`}>
                {["Ouvert", "En vente", "Fermé", "En cours"].map(button => 
                    <Button
                        leftIcon={{
                            library: "fa6",
                            name: "FaCheck"
                        }}
                        variant={{
                            classNames: {
                                button: `text-sm px-3 first:ml-4 last:mr-4 shrink-0 first:bg-primary first:text-white bg-soft-border text-strong-text`
                            }
                        }}
                    >
                        {button}
                    </Button>
                )}
            </div>
        </div>
        </>
    );
};