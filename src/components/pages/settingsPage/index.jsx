import { BsRocketFill } from "react-icons/bs";
import { FaSyncAlt } from "react-icons/fa";
import { FaArrowRightFromBracket, FaArrowRotateRight, FaBell, FaGear } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import { Block, Navbar, Tabbar } from "../..";
import { MdLogout } from "react-icons/md";
import { useApi } from "../../../hooks";
import { API_URL } from "../../../globals";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Page } from "../../others/Page";

export const SettingsPage = () => {
    const links = [
        { label: "Accueil", icon: <IoHome />, to: "/" },
        { label: "Interventions", icon: <BsRocketFill />, to: "/interventions" },
        // { label: "Contacts", icon: <FaUser />, to: "/contacts" },
        { label: "Paramètres", icon: <FaGear />, to: "/settings" },
        // { label: "Déconnexion", icon: <IoLogOut />, to: "/" },
    ];

    const { POST } = useApi(API_URL, useSelector(state => state.session.data.auth.token));

    const logout = () => {
        POST("logout")
            .then(() => {
                console.log("POST Success logout");
            })
            .catch(err => {
                console.error("POST Error logout");
                toast.error("Déconnexion impossible. Veuillez rééssayer utltérieurement");
            })
    };

    const dispatch = useDispatch();

    const test = async () => 3 === 2;

    const resetSettings = () => {
        toast.promise(test(), { loading: "En cours...", success: "Okay", error: "Erreur" });
    }

    return (
        <Page>
            <Navbar
                title={`Paramètres`}
                leftLinks={[{ icon: <FaArrowRotateRight />, onClick: () => resetSettings() }]}
                rightLinks={[{ icon: <FaArrowRightFromBracket />, onClick: () => logout() }]}
            />
            <Block
                title={`Général`}
                blockProps={{ className: "border-none rounded-none" }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        Langue
                    </div>
                    {/* Select */}
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        Système horaire
                    </div>
                    {/* Select */}
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        Devise
                    </div>
                    {/* Select */}
                </div>
            </Block>
            <Block
                title={`Interface`}
                blockProps={{ className: "border-none" }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        Mode sombre
                    </div>
                    {/* Boolean */}
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        Thème
                    </div>
                    {/* Select */}
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        Echelle
                    </div>
                    {/* Select */}
                </div>
            </Block>
            <Block
                title={`Interventions`}
                blockProps={{ className: "border-none" }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        Mode Calendrier (par défaut)
                    </div>
                    {/* Boolean */}
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        Affichage intervention (par défaut)
                    </div>
                    {/* Select today || tomorrow || week || month */}
                </div>
            </Block>
            <Tabbar
                links={links}
            />
        </Page>
    );
};