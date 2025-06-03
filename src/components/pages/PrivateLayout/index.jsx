import { IoHome } from "react-icons/io5";
import { Tabbar, TabbarLink } from "../../navigation";
import { FaGear } from "react-icons/fa6";
import { BsRocketFill } from "react-icons/bs";
// import { Outlet } from "react-router-dom";

export const PrivateLayout = () => {
    const links = [
        { label: "Accueil", icon: <IoHome />, to: "/" },
        { label: "Interventions", icon: <BsRocketFill />, to: "/interventions" },
        { label: "Paramètres", icon: <FaGear />, to: "/settings" },
    ];

    return (
        <>
            {/* <Outlet /> */}
            <Tabbar id={"layoutTabbar"}>
                {links.map((link, LI) =>
                    <TabbarLink
                        key={`link${LI}`}
                        { ...link}
                    />
                )}
            </Tabbar>
        </>
    );
}