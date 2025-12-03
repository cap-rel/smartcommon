import { FaBook, FaGear } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import { FaSyncAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

import { Button, Page } from "lib/components";
import { useStates } from "lib/hooks";

export const DevPage = () => {
    // mb-20 for tabbar and mb- for sidebar

    const list = [
        { to: "/", label: "Toutes", icon: <IoHome /> },
        { to: "/2", label: "A faire", icon: <FaBook /> },
        { to: "/3", label: "Annulées", icon: <FaSyncAlt /> },
        { to: "/4", label: "Refusées", icon: <FaGear /> }
    ];

    const getgps = (value) => {
        return value.map(gpsPoint => Number(gpsPoint));
    };

    const getMultiplegps = (value) => {
        let multiplegps = [];
        for (let i = 0; i < value.length; i += 2) {
            multiplegps.push([Number(value[i]), Number(value[i + 1])]);
        }
        return multiplegps;
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

    const location = useLocation();

    return (<Page prevPathname={location?.state?.prevPathname}>
        <div id="main" className={`fixed inset-0 text-strong-text bg-medium-bg`}>
            <Button disabled={true} onClick={() => {}} buttonsProps={{ className: "text-white bg-red-500" }}>
                Bonjour
            </Button>
                        <Link to={"/dev2"} state={{ prevPathname: location.pathname }}>Bonjour</Link>
        
            {/* <Navbar 
                title={`Accueil`}
                left={[
                    { to: "Carnet", icon: <IoHome /> },
                ]}
                right={[
                    { to: "Accueil", icon: <FaMagnifyingGlass /> },
                    // { to: "Accueil", icon: <IoEllipsisHorizontal /> },
                ]}
                links={list}
            /> */}
                
            {/* <List
                list={list}
                listItem={item => 
                    <div className={`p-4 row-between-center gap-4`}>
                        <div className={`row-v-center text-soft-text`}>
                            <div>
                                {item.icon}
                            </div>
                            <div>
                                {item.label}
                            </div>
                        </div>
                        <Button
                            left={<IoEllipsisHorizontal />}
                            className={`text-strong-text bg-soft`}
                        />
                    </div>
                }
                className={`divide-y divide-soft-border`}
            />  */}
            {/* <Calendar /> */}

            {/* <Page pageProps={{ className: "p-app-base" }}> */}

              <form 
                
                            className={`gap-4 flex flex-col p-4 overflow-y-auto max-h-full`}
                            onSubmit={e => {
                                e.preventDefault();
                                // if (e.target.checkValidity()) {
                                //     e.preventDefault();
                                //     console.log("test");
                                // } else {
                                //     console.log("test2")
                                // }
                                // e.preventDefault();
                                const formData = new FormData(e.target);
                                // console.log(formData.get("range"));
                                // console.log(formData.get("check"));
                                // console.log(formData.getAll("checks"));
                                // console.log(formData.get("color"));
                                // console.log(formData.get("date"));
                                // console.log(formData.get("datetime"));
                                // console.log(formData.get("time"));
                                // console.log(formData.get("timestamp"));
                                // console.log(formData.get("textarea"));
                                // console.log(formData.get("address"));
                                // console.log(getgps(formData.getAll("gps")));
                                // console.log(getMultiplegps(formData.getAll("multipleGps")));
                                // console.log(formData.has("booleanSwitch"));
                                // console.log(formData.has("booleanCheckbox"));
                                // console.log(formData.has("booleanRadio"));
                                // console.log(formData.has("booleanIcon"));
                                // console.log(formData.get("select"));
                                // console.log(formData.getAll("multipleSelect"));
                                // console.log(formData.get("signature"));
                                // console.log(formData.get("editor"));
                                // console.log(formData.get("duration"));
                                // console.log(formData.getAll("array"));
                                // console.log(formData.get("rating"));
                                // console.log(getMedia(formData.getAll("photo")));
                                // console.log(getMedias(formData.getAll("photos")));
                                // console.log(getMedia(formData.getAll("audio")));
                                // console.log(getMedias(formData.getAll("audios")));
                                // console.log(getMedia(formData.getAll("video")));
                                // console.log(getMedias(formData.getAll("videos")));
                                // console.log(getFile(formData.getAll("file")));
                                // console.log(getFiles(formData.getAll("files")));
                            }}
                        >
                            {/* <Button
                                onClick={() => alert("Bonjour")}
                                className={`self-start`}
                            >
                                Alerte
                            </Button>
                            <Button
                                onClick={() => confirm("Bonjour")}
                                className={`self-start`}
                            >
                                Confirmation
                            </Button>
                            <Button
                                onClick={() => prompt("Bonjour")}
                                className={`self-start`}
                            >
                                Entrée de donnée
                            </Button> */}
                            {/* <Range
                                label={`Range`}
                                name={`range`}
                            />
                            <Checker
                                label={`Case à cocher`}
                                name={`check`}
                                options={["pomme", "banane", "fraise"]}
                            />
                            <Checker
                                label={`Cases à cocher`}
                                name={`checks`}
                                options={["pomme", "banane", "fraise"]}
                                multiple
                            />
                            <ColorPicker
                                label={`Couleur`}
                                labelRow
                                name={`color`}
                            /> */}
                            {/* <Input
                                // max={4}
                                min={4}
                                // type="varchar"
                                // required
                            /> */}
                            {/* <Input
                                type={`date`}
                                icon={<FaEnvelope />} 
                                label={"Input"}
                                name={`date`}
                                // formNoValidate
                            />
                            <Input
                                type={`datetime`}
                                icon={<FaEnvelope />} 
                                label={"Input"}
                                name={`datetime`}
                                // formNoValidate
                            />
                            <Input
                                type={`time`}
                                icon={<FaEnvelope />} 
                                label={"Input"}
                                name={`time`}
                                // formNoValidate
                            />
                            <Input
                                type={`timestamp`}
                                icon={<FaEnvelope />} 
                                label={"Input"}
                                name={`timestamp`}
                                // formNoValidate
                            /> */}
                            {/* <Textarea
                                label={"Textarea"}
                                name={`textarea`}
                            />
                            <AddressInput
                                label={`Adresse`}
                                name={`address`}
                            />
                            <gps
                                label={`Localisation`}
                                name={`gps`}
                            />
                            <gps 
                                label={`Localisation multiple`}
                                name={`multipleGps`}
                                multiple
                            />
                            <Boolean
                                label={`Bouléen switch`}
                                type={`switch`}
                                name={`booleanSwitch`}
                            />
                            <Boolean
                                label={`Bouléen checkbox`}
                                type={`checkbox`}
                                name={`booleanCheckbox`}
                            />
                            <Boolean
                                label={`Bouléen radio`}
                                type={`radio`}
                                name={`booleanRadio`}
                            />
                            <Boolean
                                label={`Bouléen star`}
                                type={`icon`}
                                icon={<FaStar />}
                                name={`booleanIcon`}
                            />
                            <Select
                                label={`Sélection`}
                                name={`select`}
                                placeholder={`test`}
                                options={["pomme", "banane", "fraise"]}
                            />
                            <Select
                                label={`Sélection multiple`}
                                name={`multipleSelect`}
                                multiple
                                options={["pomme", "banane", "fraise"]}
                            />
                            <SignaturePad
                                label={`Signature`}
                                name={`signature`}
                            />
                            <Editor
                                label={`Editeur Markdown`}
                                name={`editor`}
                            />
                            <Timer
                                label={`Durée`}
                                name={`duration`}
                            />
                            <Array
                                label={`Tableau`}
                                name={`array`}
                            />
                            <Rater
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
                            <VideosUploader
                                label={`Video`}
                                name={`video`}
                            />
                            <VideosUploader
                                label={`Videos`}
                                name={`videos`}
                                multiple
                            />
                            <FilesUploader
                                label={`Fichier`}
                                name={`file`}
                            />
                            <FilesUploader
                                label={`Fichiers`}
                                name={`files`}
                                multiple
                            /> */}
                            {/* <div className="fixed inset-0 bg-red-500/20">
            
                            </div> */}
            
                            {/* <Editor
                                value={searchBar}
                                onChange={value => set("searchbar", value)}
                            />
                            <Photos name={`photos`} /> */}

                            {/* <Spinner /> */}
                        </form>
                    {/* </Page> */}
                
            {/* <Tabbar>
                <TabbarLink
                    label={`Accueil`}
                    to={`/`}
                    icon={<IoHome />}
                    // variant={"classic"}
                />
                <TabbarLink
                    label={`Carnet`}
                    to={`/2`}
                    icon={<FaBook />}
                />
                <TabbarLink
                    label={`Synchroniser`}
                    to={`/3`}
                    icon={<FaSyncAlt />}
                />
                <TabbarLink
                    label={`Paramètres`}
                    to={`/4`}
                    icon={<FaGear />}
                />
            </Tabbar> */}
            {/* <Sidebar>
                <SidebarLink
                    label={`Accueil`}
                    to={`/`}
                    icon={<IoHome />}
                />
                <SidebarLink
                    label={`Carnet`}
                    to={`/`}
                    icon={<FaBook />}
                />
                <SidebarLink
                    label={`Synchroniser`}
                    to={`/`}
                    icon={<FaSyncAlt />}
                />
                <SidebarLink
                    label={`Paramètres`}
                    to={`/`}
                    icon={<FaGear />}
                />
            </Sidebar> */}
        </div>
        </Page>
    );
};