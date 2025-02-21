import { useRef } from "react";
import { isEmpty } from "../../../globals/functions";
import { useStates } from "../../../hooks";
import { Button, Panel } from "../../others";
import { useEffect } from "react";
import { Multi, Single } from "../../form";

export const SearchBar = ({
    isVisible = true,
    setVisibility = () => {}
}) => { 
    const { states, set } = useStates({
        searchBar: "",
    });

    const { searchBar } = states;

    const inputRef = useRef(null);

    useEffect(() => {
        if (isVisible) {
            inputRef.current.focus();
        }
    }, [isVisible]);

    const options = [
        { label: "Noms", value: "name" },
        { label: "Stockages", value: "stock" },
        { label: "Lieux", value: "place" },
        { label: "Prix", value: "price" }
    ]

    return (
        <Panel
            isVisible={isVisible}
            setVisibility={setVisibility}
            position={`bottom`}
            variant={{
                classNames:{
                    panel: "min-h-screen bg-soft rounded-none col gap-4",
                    icon: "hidden"
                }
            }}
        >
            <div className={`gap-1 border row-v-center border-success`}>
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
                    ref={inputRef}
                    value={searchBar}
                    placeholder={`Rechercher`}
                    onChange={e => set("searchBar", e.target.value)}
                    className={`w-full outline-none`}
                />
                {!isEmpty(searchBar) && 
                    <Button
                        leftIcon={{
                            library: "bonus",
                            name: "RiCloseLargeLine"
                        }}
                        variant={{
                            classNames: {
                                button: `text-strong-text rounded-full p-3 -mr-3 bg-soft`
                            }
                        }}
                        onClick={() => set("searchBar", "")}
                    />
                }
            </div>
            <div className={`border border-error`}>
                <div className={`gap-4 col`}>
                    <div className={``}>Rechercher par...</div>
                        <Multi name={"filter"} options={options} value={["name", "price"]} variant={{mode: `checkbox`}}/>
                </div>
            </div>
        </Panel>
    );
};