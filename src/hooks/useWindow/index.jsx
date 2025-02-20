import { useEffect } from "react";
import { useStates } from "../../hooks";

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
            return { w: 0, h: 0 };
        }
        return { w: window.innerWidth, h: window.innerHeight };
    };

    const getScroll = () => {
        if (!isWindowAvailable) {
            return { x: 0, y: 0 };
        }
        return { x: window.scrollX, y: window.scrollY };
    }

    const getDarkMode = () => {
        if (!isWindowAvailable) {
            return false;
        };
        return window.matchMedia("(prefers-color-scheme: dark)").matches
    };

    const { states, set } = useStates({
        orientation: getOrientation(),
        windowDimension: getWindowDimension(),
        scroll: getScroll(),
        darkMode: getDarkMode(),
    })
  
    const handleResize = () => {
        set("orientation", getOrientation());
        set("windowDimension", getWindowDimension());
    }

    const handleScroll = () => {
        set("scroll", getScroll());
    }

    const handleLoad = () => {
    }

    const handleDarkMode = () => set("darkMode", getDarkMode());

    useEffect(() => {
        if (!isWindowAvailable) {
            return;
        }

        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("load", handleLoad);
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", handleDarkMode);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleScroll);
            window.addEventListener("load", handleLoad);
            window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", handleDarkMode);
        }
    }, [])

    return states;
};