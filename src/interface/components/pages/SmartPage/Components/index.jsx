import { FaReact } from "react-icons/fa6";
// import { Link } from "react-router-dom";
import { components } from "../components";

export const Components = () => {
    // const location = useLocation();

    return (
        <div className={`col w-50 shrink-0 h-full relative border-r border-soft bg-softest`}>   
            {/* <div className={`sticky top-0 p-4 font-semibold uppercase text-lg row justify-center items-center bg-primary text-white`}>
                Composants
            </div>
            <div className={`grow col overflow-y-auto py-4 gap-4 text-sm`}>
                {components.map((group, GI) =>
                    <div 
                        key={`group${GI}`}
                        className={`col gap-2`}
                    >
                        <div className={`text-strongest font-semibold px-4 truncate uppercase`}>
                            {group.label}
                        </div>
                        <div className={`col`}>
                            {group.components.map((component, CI) =>
                                <Link 
                                    key={`component${CI}`}
                                    to={`/${component}`}
                                    className={`${location.pathname === `/${component}` ? "bg-primary/20 text-strongest border-primary" : "hover:brightness-soft bg-softest border-softest text-stronger"} border-l-4 px-6 py-1.5 duration-100 row items-center gap-2 w-full cursor-pointer`}
                                >
                                    <FaReact className={`${location.pathname === `/${component}` ? "text-primary" : "text-stronger"}`} />
                                    <div className={`truncate`}>
                                        {component}
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div> */}
        </div>
    );
}