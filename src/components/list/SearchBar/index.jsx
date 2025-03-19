import { useRef } from "react";
import { isEmpty } from "../../../globals/functions";
import { useStates } from "../../../hooks";
import { Button, Panel } from "../../others";
import { useEffect } from "react";
import { Address, Array, Audios, Boolean, Check, ColorPicker, Duration, Editor, Files, GpsPoints, Input, Photos, Range, Rating, Select, Signature, Textarea, Videos } from "../../form";
import { FaEnvelope, FaRegStar, FaStar } from "react-icons/fa6";

export const SearchBar = ({
    isOpen = true,
    closeSearchBar = () => {}
}) => { 
    const { states, set } = useStates({
        searchBar: "",
    });

    const { searchBar } = states;

    // useEffect(() => console.log(searchBar), [searchBar]);

    const getGpsPoints = (value) => {
        return value.map(gpsPoint => Number(gpsPoint));
    };

    const getMultipleGpsPoints = (value) => {
        let multipleGpsPoints = [];
        for (let i = 0; i < value.length; i += 2) {
            multipleGpsPoints.push([Number(value[i]), Number(value[i + 1])]);
        }
        return multipleGpsPoints;
    };

    const getMedia = (value) => {
        return { url: value[0], capture: value[1] === "true" ? true : false, title: value[2], description: value[3] };
    };

    const getMedias = (value) => {
        let medias = [];
        for (let i = 0; i < value.length; i += 4) {
            medias.push({ url: value[i], capture: value[i + 1] === "true" ? true : false, title: value[i + 2], description: value[i + 3] });
        }
        return medias;
    };

    const getFile = (value) => {
        return { url: value[0], type: value[1], title: value[2], description: value[3] };
    };

    const getFiles = (value) => {
        let files = [];
        for (let i = 0; i < value.length; i += 4) {
            files.push({ url: value[i], type: value[i + 1], title: value[i + 2], description: value[i + 3] });
        }
        return files;
    };

    return (
        <Panel
            isOpen={isOpen}
            closePanel={closeSearchBar}
            position={`bottom`}
            className={`overflow-y-auto h-2/3 bg-soft`}
        >
            {/* <div className={`gap-1 border row-v-center border-success`}>
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
                    onClick={() => closeSearchBar(false)}
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
            </div> */}
            <form 
                className={`gap-4 col`}
                onSubmit={e => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    console.log(formData.get("range"));
                    console.log(formData.get("check"));
                    console.log(formData.getAll("checks"));
                    console.log(formData.get("color"));
                    console.log(formData.get("input"));
                    console.log(formData.get("textarea"));
                    console.log(formData.get("address"));
                    console.log(getGpsPoints(formData.getAll("gps")));
                    console.log(getMultipleGpsPoints(formData.getAll("multipleGps")));
                    console.log(formData.has("booleanSwitch"));
                    console.log(formData.has("booleanCheckbox"));
                    console.log(formData.has("booleanRadio"));
                    console.log(formData.has("booleanIcon"));
                    console.log(formData.get("select"));
                    console.log(formData.getAll("multipleSelect"));
                    console.log(formData.get("signature"));
                    console.log(formData.get("editor"));
                    console.log(formData.get("duration"));
                    console.log(formData.getAll("array"));
                    console.log(formData.get("rating"));
                    console.log(getMedia(formData.getAll("photo")));
                    console.log(getMedias(formData.getAll("photos")));
                    console.log(getMedia(formData.getAll("audio")));
                    console.log(getMedias(formData.getAll("audios")));
                    console.log(getMedia(formData.getAll("video")));
                    console.log(getMedias(formData.getAll("videos")));
                    console.log(getFile(formData.getAll("file")));
                    console.log(getFiles(formData.getAll("files")));
                }}
            >
                <Range
                    label={`Range`}
                    name={`range`}
                />
                <Check
                    label={`Case à cocher`}
                    name={`check`}
                    options={["pomme", "banane", "fraise"]}
                />
                <Check
                    label={`Cases à cocher`}
                    name={`checks`}
                    options={["pomme", "banane", "fraise"]}
                    multiple
                />
                <ColorPicker
                    label={`Couleur`}
                    labelRow
                    name={`color`}
                />
                <Input
                    type={`varchar`}
                    left={<FaEnvelope />} 
                    label={"Input"}
                    name={`input`}
                />
                <Textarea
                    label={"Textarea"}
                    name={`textarea`}
                />
                <Address
                    label={`Adresse`}
                    name={`address`}
                />
                <GpsPoints 
                    label={`Localisation`}
                    name={`gps`}
                />
                <GpsPoints 
                    label={`Localisation multiple`}
                    name={`multipleGps`}
                    multiple
                />
                <Boolean
                    label={`Bouléen switch`}
                    variant={`switch`}
                    labelRow
                    name={`booleanSwitch`}
                />
                <Boolean
                    label={`Bouléen checkbox`}
                    variant={`checkbox`}
                    labelRow
                    name={`booleanCheckbox`}
                />
                <Boolean
                    label={`Bouléen radio`}
                    variant={`radio`}
                    labelRow
                    name={`booleanRadio`}
                />
                <Boolean
                    label={`Bouléen star`}
                    variant={`icon`}
                    icon={<FaStar />}
                    labelRow
                    name={`booleanIcon`}
                />
                <Select
                    label={`Sélection`}
                    name={`select`}
                    defaultValue=""
                    placeholder={`test`}
                    options={["pomme", "banane", "fraise"]}
                />
                <Select
                    label={`Sélection multiple`}
                    name={`multipleSelect`}
                    multiple
                    options={["pomme", "banane", "fraise"]}
                />
                <Signature 
                    label={`Signature`}
                    name={`signature`}
                />
                <Editor
                    label={`Editeur Markdown`}
                    name={`editor`}
                />
                <Duration
                    label={`Durée`}
                    name={`duration`}
                />
                <Array
                    label={`Tableau`}
                    name={`array`}
                />
                <Rating
                    label={`Note`}
                    labelRow
                    name={`rating`}
                />
                <Photos
                    label={`Photo`}
                    name={`photo`}
                />
                <Photos
                    label={`Photos`}
                    name={`photos`}
                    multiple
                />
                <Audios
                    label={`Audio`}
                    name={`audio`}
                />
                <Audios
                    label={`Audios`}
                    name={`audios`}
                    multiple
                />
                <Videos
                    label={`Video`}
                    name={`video`}
                />
                <Videos
                    label={`Videos`}
                    name={`videos`}
                    multiple
                />
                <Files
                    label={`Fichier`}
                    name={`file`}
                />
                <Files
                    label={`Fichiers`}
                    name={`files`}
                    multiple
                />
                {/* <div className="fixed inset-0 bg-red-500/20">

                </div> */}

                {/* <Editor
                    value={searchBar}
                    onChange={value => set("searchbar", value)}
                />
                <Photos name={`photos`} /> */}
                <button>test</button>
            </form>
        </Panel>
    );
};