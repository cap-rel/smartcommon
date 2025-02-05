import { useEffect, useRef } from "react";
import { Input, Label, Textarea } from "../../form";
import { Icon } from "../../others";
import { isEmpty, isNull, removeFileExtension, secondsToTime } from "../../../globals/functions";
import { useNavigator, useStates } from "../../../hooks";
import { propTypes } from "./props";

export const Videos = ({
    label = null,
    id = null,
    help = null,
    min = 0,
    size = null,
    max = null,
    multiple = false,
    readOnly = false,
    required = false,
    disabled = false,
    value,
    onChange = () => {},
    color = null,
    className = null
}) => {
    const labelProps = { label, id, help, required, className };

    const { deviceType } = useNavigator();

    const inputCameraRef = useRef(null);
    const inputDownloadRef = useRef(null);

    const inputs = [{ ref:inputCameraRef, capture: true }, { ref: inputDownloadRef, capture: false }];

    const videoRef = useRef(null);

    const { states, set } = useStates({
        selectedVideoId: null,
    }) 

    const { selectedVideoId } = states;

    const selectedVideo = value[selectedVideoId];

    const handlePhotosOnChange = (e) => {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        videoRef.current.src = url;
        // videoRef.current.type = file.type;
        if (isNull(selectedVideoId)) {
            onChange([...value, { file: file, url: url, title: "", duration: "", description: "" }]);
            set("selectedVideoId", value.length);                    
        } else {
            const newValue = [...value];
            newValue[selectedVideoId].url = url;
            // newValue[selectedVideoId].file = file;
            onChange(newValue);    
        }
        return () => URL.revokeObjectURL(url);
    };

    return (
        <Label { ...labelProps}>
            {inputs.map((input, II) =>
                <input
                    key={"input_" + II}
                    className={`hidden`}
                    ref={input.ref}
                    type={`file`}
                    accept={`video/*`}
                    capture={input.capture}
                    onChange={handlePhotosOnChange}
                />
            )}
            <div className={`border border-smt rounded-md col w-full max-w-120`}>
                <div className={`row-between-center bg-soft-smt rounded-t-md p-2`}>
                    <div className={`row-v-center gap-2`}>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                inputCameraRef.current.click();
                            }}
                            className={`p-2 bg-soft-smt rounded-full text-white text-2xl button-smt`}
                        >
                            <Icon library={`fa6`} name={`FaVideo`} />
                        </button>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                inputDownloadRef.current.click();
                            }}
                            className={`p-2 bg-soft-smt rounded-full text-white text-2xl button-smt`}
                        >
                            <Icon library={`fa6`} name={`FaFileImport`} />
                        </button>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            onChange([]);
                        }}
                        className={`p-2 bg-soft-smt rounded-full text-error text-2xl button-smt`}
                    >
                        <Icon library={`io5`} name={`IoTrash`} />
                    </button>
                </div>
                {!isEmpty(value) 
                    ?   <table className={`text-smt`}><tbody>
                            {value.map((record, RI) => 
                                <tr key={"video_" + RI}>
                                    <td className={`p-2`}>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                set("selectedVideoId", RI);
                                                videoRef.current.src = value[RI].url;
                                                // videoRef.current.play();
                                            }}
                                            className={`button-smt rounded-full p-2 bg-smt text-2xl`}
                                        >
                                            <Icon library={`fa6`} name={`FaEye`}/>
                                        </button> 
                                    </td>
                                    <td className={`p-2 text-soft-smt max-w-40 truncate`}>
                                        <span>{record.title}</span>
                                    </td>
                                    <td className={`p-2 text-soft-smt`}>
                                        <span>{secondsToTime(record.duration)}</span>
                                    </td>
                                    <td className={`p-2 text-right`}>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onChange([...value.slice(0, RI), ...value.slice(RI + 1)])
                                            }}
                                            className={`button-smt rounded-full p-2 bg-smt text-2xl text-error`}
                                        >
                                            <Icon library={`io5`} name={`IoTrash`}/>
                                        </button> 
                                    </td>
                                </tr>
                            )}
                        </tbody></table>
                    :   <div className={`col-h-center gap-2 p-4 text-soft-smt`}>
                            <Icon library={`fa6`} name={`FaFileVideo`} className={`text-4xl`} />
                            <span className={`italic`}>Aucune vidéo</span>
                        </div>
                }
                <div className={`
                    ${!isNull(selectedVideoId) ? "translate-y-0" : "translate-y-full"}
                    ${deviceType !== "desktop" && "w-full"}
                    z-60 duration-300 fixed-h-center max-h-full bottom-0 col gap-4 overflow-y-auto bg-smt rounded-t-md 
                `}>
                    <div className={`sticky top-0 p-2 border-b border-smt bg-soft-smt z-30`}>
                        <div className={`row-full-center gap-2`}>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    inputCameraRef.current.click();
                                }}
                                className={`p-2 bg-soft-smt rounded-full text-white text-2xl button-smt`}
                            >
                                <Icon library={`fa6`} name={`FaVideo`} />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    inputDownloadRef.current.click();
                                }}
                                className={`p-2 bg-soft-smt rounded-full text-white text-2xl button-smt`}
                            >
                                <Icon library={`fa6`} name={`FaFileImport`} />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    onChange([...value.slice(0, selectedVideoId), ...value.slice(selectedVideoId + 1)])
                                    set("selectedVideoId", null);
                                }}
                                className={`p-2 bg-soft-smt rounded-full text-error text-2xl button-smt`}
                            >
                                <Icon library={`io5`} name={`IoTrash`} />
                            </button>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                videoRef.current.pause();
                                videoRef.current.currentTime = 0;
                                const newValue = [...value];
                                if (isEmpty(newValue[selectedVideoId].title)) {
                                    newValue[selectedVideoId].title = `Vidéo ${selectedVideoId + 1}`;
                                    onChange(newValue);
                                }
                                set("selectedVideoId", null);
                            }}
                            className={`absolute top-2 right-2 button-smt rounded-full p-2 bg-soft-smt text-2xl`}
                        >
                            <Icon library={`io5`} name={`IoClose`}/>
                        </button>
                    </div>
                        
                    <div className={`col gap-4 p-6`}>
                        <video
                            ref={videoRef}
                            controls={true}
                            onLoadedMetadata={(e) => {
                                const newValue = [...value];
                                newValue[selectedVideoId] = { ...newValue[selectedVideoId], duration: e.target.duration };
                                onChange(newValue);
                            }} 
                            className={`rounded-md max-h-100 border border-smt`}
                        >
                            {/* <source 
                            // src={selectedVideo?.url} 
                            // type={selectedVideo?.file.type} 
                            /> */}
                            Votre navigateur ne supporte pas la lecture vidéo.
                        </video>
                        <Input
                            placeholder={`Titre de la vidéo ...`}
                            value={selectedVideo?.title}
                            onChange={(newState) => {
                                const newValue = [...value];
                                newValue[selectedVideoId].title = newState;
                                onChange(newValue);
                            }}
                            className={`bg-smt rounded-md mx-2`}
                        />
                        <Textarea
                            placeholder={`Description de la vidéo ...`}
                            value={selectedVideo?.description}
                            onChange={(newState) => {
                                const newValue = [...value];
                                newValue[selectedVideoId].description = newState;
                                onChange(newValue);
                            }}
                            className={`bg-smt rounded-md mx-2`}
                        />
                    </div>
                </div>
            </div>
            {/* <div>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        inputRef.current.click();
                    }}
                    className={`p-4 border border-primary rounded-full bg-primary dark:bg-primary-20 text-white dark:text-primary text-2xl button-smt`}
                >
                    <Icon library={`fa6`} name={`FaVideo`} />
                </button>
            </div> */}
        </Label>
    );
};

Videos.propTypes = propTypes;