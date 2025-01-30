import { useEffect } from "react";
import useStates from "../useStates";

export const useWindow = () => {
    const isWindowAvailable = typeof window !== "undefined";

   const getOrientation = () => {
        if (!isWindowAvailable) {
            return "portrait";
        };
        return window.screen.orientation.type.includes("landscape") ? "landscape" : "portrait";
    }

    const getWindowDimension = () => {
        if (!isWindowAvailable) {
            return { width: 0, height: 0 };
        }
        return { width: window.innerWidth, height: window.innerHeight };
    };

    const getDarkMode = () => {
        if (!isWindowAvailable) {
            return false;
        };
        return window.matchMedia("(prefers-color-scheme: dark)").matches
    };

    const { states, set } = useStates({
        orientation: getOrientation(),
        windowDimension: getWindowDimension(),
        darkMode: getDarkMode()
    })
  
    const handleResize = () => {
        set("orientation", getOrientation());
        set("windowDimension", getWindowDimension());
    }

    const handleDarkMode = () => set("darkMode", getDarkMode());

    useEffect(() => {
        if (!isWindowAvailable) {
            return;
        }

        window.addEventListener("resize", handleResize);
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", handleDarkMode);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", handleDarkMode);
        }
    }, [])

    return states;
};