import { isEmpty } from "../../../globals/functions";
import { useStates } from "../../../hooks";
import { Button, Panel } from "../../others";

export const SearchBar = ({
    isVisible = true,
    setVisibility = () => {}
}) => { 
    const { states, set } = useStates({
        searchBar: "",
    });

    const { searchBar } = states;

    return (
        <Panel
            isVisible={isVisible}
            setVisibility={setVisibility}
            position={`bottom`}
            variant={{
                classNames:{
                    panel: "min-h-screen bg-soft rounded-none",
                    icon: "hidden"
                }
            }}
        >
            <div className={`gap-1 row-v-center`}>
                <Button
                    leftIcon={{
                        library: "fa6",
                        name: "FaArrowLeft"
                    }}
                    variant={{
                        classNames: {
                            button: `text-strong-text -ml-3 rounded-full p-3 bg-soft`
                        }
                    }}
                    onClick={() => setVisibility(false)}
                />
                <input
                    value={searchBar}
                    onChange={e => set("searchBar", e.target.value)}
                    className={`outline-none grow`}
                />
                {!isEmpty(searchBar) && 
                    <Button
                        leftIcon={{
                            library: "bonus",
                            name: "RiCloseLargeLine"
                        }}
                        variant={{
                            classNames: {
                                button: `text-strong-text rounded-full p-3 bg-soft`
                            }
                        }}
                        onClick={() => set("searchBar", "")}
                    />
                }
            </div>
        </Panel>
    );
};