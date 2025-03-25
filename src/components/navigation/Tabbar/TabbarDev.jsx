import { IoHome } from "react-icons/io5";
import { Tabbar } from ".";
import { TabbarLink } from "../TabbarLink";
import { FaGear } from "react-icons/fa6";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const TabbarDev = (props) => {
    return (
        <>
            <Tabbar>
                <TabbarLink 
                    to={`/Tabbar?link=home`} 
                    icon={<IoHome />} 
                    label={`Accueil`} 
                    { ...props}
                />
                <TabbarLink 
                    to={`/Tabbar?link=settings`} 
                    icon={<FaGear />} 
                    label={`Paramètres`} 
                    { ...props}
                />
            </Tabbar>
        </>
    );
};

export const Variants = () => {
    return (
        <>
            <Tabbar>
                <TabbarLink 
                    to={`/tabbar?link=home`} 
                    icon={<IoHome />} 
                    label={`Accueil`} 
                />
                <TabbarLink 
                    to={`/tabbar?link=settings`} 
                    icon={<FaGear />} 
                    label={`Paramètres`} 
                />
            </Tabbar>
        </>
    );
};