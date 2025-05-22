import { BsRocketFill } from "react-icons/bs";
import { FaSyncAlt } from "react-icons/fa";
import { FaArrowRightFromBracket, FaArrowRotateRight, FaBell, FaGear } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import { Block, Boolean, Checker, Navbar, Panel, RadioBar, Select, Tabbar, UpperNavbarLink } from "../..";
import { MdLogout } from "react-icons/md";
import { useApi, useStates } from "../../../hooks";
import { API_URL, sortArrayByString } from "../../../globals";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Page } from "../../others/Page";
import { unsetSession } from "../../../reduxStore/reducers/sessionSlice";
import iso3166 from "iso-3166-2";
import { resources } from "../../../i18n";
import { changeAllSettings, changeSetting as rxChangeSetting, defaultSettings, setSettings, unsetSettings } from "../../../reduxStore/reducers/settingsSlice";
import { unsetDrafts } from "../../../reduxStore/reducers/draftsSlice";
import { unsetUpdates } from "../../../reduxStore/reducers/updatesSlice";

const Setting = (props) => {
    const { children, label, col } = props;

    return (
        <div className={`flex ${col ? "flex-col gap-app-sm" : "gap-app-base items-center"} justify-between px-app-base py-app-sm`}>
            <div className={`grow`}>
                {label}
            </div>
            <div className={`shrink-0`}>
                {children}
            </div>
        </div>
    );
};

export const SettingsPage = () => {
    const { user, token } = useSelector(state => state.session.data);

    const { POST } = useApi(API_URL, token);
    
    const dispatch = useDispatch();

    const changeSetting = (setting, value) => dispatch(rxChangeSetting({ user, setting, value }));

    const { states, set } = useStates({
        isLoggingOut: false
    });

    const { isLoggingOut } = states;

    const logout = () => {
        set("isLoggingOut", false);
        setTimeout(() => {
            POST("logout")
                .then(() => {
                    dispatch(unsetSession());
                    dispatch(unsetDrafts());
                    dispatch(unsetUpdates());
                    dispatch(unsetSettings());
                    set("isLoggingOut", false);
                    console.log("POST 'logou' success");
                })
                .catch(err => {
                    toast.error("Déconnexion impossible. Veuillez rééssayer utltérieurement");
                    set("isLoggingOut", false);
                    console.error("POST 'logout' error");
                    console.error(err);
                })
        }, 1000)
    };

    const resetSettings = () => dispatch(changeAllSettings({ user }));

    const settings = useSelector(state => state.settings.data);

    const { lang, country, darkMode, theme, scale, calendarModeByDefault, interventionsFilterByDefault, deleteDraftWhenDone } = settings;

    return (
        <Page pageProps={{ className: `mb-(--layoutTabbar-tabbar-height)` }}>
            <Panel

            />
            <Navbar
                title={`Paramètres`}
                upperLeftLinks={<UpperNavbarLink icon={<FaArrowRotateRight />} onClick={() => resetSettings()} />}
                upperRightLinks={<UpperNavbarLink icon={<FaArrowRightFromBracket />} onClick={() => logout()} />}
            />
            <Block
                title={`Localisation`}
                blockProps={{ className: "gap-0 p-0 divide-y divide-border" }}
            >
                <Setting label={`Langue`}>
                    <Select
                        selectProps={{ className: `px-app-sm py-app-xs text-app-xs` }}
                        value={lang}
                        onChange={value => changeSetting("lang", value)}
                        options={sortArrayByString(Object.keys(resources))}
                    />
                </Setting>
                <Setting label={`Pays`}>
                    <Select
                        containerProps={{ className: `max-w-50` }}
                        selectProps={{ className: `px-app-sm py-app-xs text-app-xs` }}
                        value={country}
                        onChange={value => changeSetting("country", value)}
                        options={sortArrayByString(Object.entries(iso3166.data).map(([code, country]) => ({ label: country.name, value: code })), "label")}
                    />
                </Setting>
            </Block>
            <Block
                title={`Interface`}
                blockProps={{ className: "gap-0 p-0 divide-y divide-border" }}
            >
                <Setting label={`Mode sombre`}>
                    <Boolean
                        type={`switch`}
                        value={darkMode}
                        onChange={value => changeSetting("darkMode", value)}
                    />
                </Setting>
                <Setting label={`Thème`}>
                    <div className={`font-app-semibold`}>SmartInterventions</div>
                </Setting>
                <Setting label={`Echelle`}>
                    <RadioBar
                        optionsContainerProps={{ className: `text-app-xs` }}
                        value={scale}
                        onChange={value => changeSetting("scale", value)}
                        options={[
                            { label: "50%", value: 50 },
                            { label: "100%", value: 100 },
                            { label: "150%", value: 150 },
                            { label: "200%", value: 200 }
                        ]}
                    />
                </Setting>
            </Block>
            <Block
                title={`Interventions`}
                blockProps={{ className: "gap-0 p-0 divide-y divide-border" }}
            >
                <Setting label={`Mode Calendrier (par défaut)`}>
                    <Boolean
                        type={`switch`}
                        value={calendarModeByDefault}
                        onChange={value => changeSetting("calendarModeByDefault", value)}
                    />
                </Setting>
                <Setting label={`Affichage intervention (par défaut)`} col>
                    <RadioBar
                        optionsContainerProps={{ className: `w-full text-app-xs` }}
                        optionProps={{ className: `grow text-center` }}
                        value={interventionsFilterByDefault}
                        onChange={value => changeSetting("interventionsFilterByDefault", value)}
                        options={[
                            { label: "Aujourd'hui", value: "today" },
                            { label: "Toute la semaine", value: "week" },
                            { label: "Tout le mois", value: "month" },
                        ]}
                    />
                </Setting>
            </Block>
            <Block
                title={`Stockage`}
                blockProps={{ className: "gap-0 p-0 divide-y divide-border" }}
            >
                <Setting label={`Suppression des brouillons des interventions terminées`}>
                    <Boolean
                        type={`switch`}
                        value={deleteDraftWhenDone}
                        onChange={value => changeSetting("deleteDraftWhenDone", value)}
                    />
                </Setting>
            </Block>

        </Page>
    );
};