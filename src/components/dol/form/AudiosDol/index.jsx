import { useEffect, useRef } from "react";
import { IconDol, InputDol, LabelDol, TextareaDol } from "../../../dol";
import { isEmpty, isNull, removeFileExtension, secondsToTime } from "../../../../globals/functions";
import { useNavigator, useStates } from "../../../hooks";
import { propTypes } from "./props";

const AudiosDol = ({
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

    const inputMicrophoneRef = useRef(null);
    const inputDownloadRef = useRef(null);

    const inputs = [{ ref: inputMicrophoneRef, capture: "user" }, { ref: inputDownloadRef, capture: false }];

    const audioRef = useRef(null);

    const { states, set } = useStates({
        selectedAudioIndex: null,
    }) 

    const { selectedAudioIndex } = states;

    const selectedAudio = value[selectedAudioIndex];

    const handleAudiosOnChange = (e) => {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        audioRef.current.src = url;
        // audioRef.current.type = file.type;
        if (isNull(selectedAudioIndex)) {
            onChange([...value, { file: file, url: url, title: "", duration: "", description: "" }]);
            set("selectedAudioIndex", value.length);                    
        } else {
            const newValue = [...value];
            newValue[selectedAudioIndex].url = url;
            // newValue[selectedAudioIndex].file = file;
            onChange(newValue);    
        }
        return () => URL.revokeObjectURL(url);
    };

    return (
        <LabelDol { ...labelProps}>
            {inputs.map((input, II) =>
                <input
                    key={"input_" + II}
                    className={`hidden`}
                    ref={input.ref}
                    type={`file`}
                    accept={`audio/*`}
                    capture={input.capture}
                    onChange={handleAudiosOnChange}
                />
            )}
            <div className={`border border-dol rounded-md col w-full max-w-120`}>
                <div className={`row-between-center bg-soft-dol p-2`}>
                    <div className={`row-v-center gap-2`}>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                inputMicrophoneRef.current.click();
                            }}
                            className={`p-2 bg-soft-dol rounded-full text-white text-2xl button-dol`}
                        >
                            <IconDol library={`fa6`} icon={`FaMicrophoneLines`} />
                        </button>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                inputDownloadRef.current.click();
                            }}
                            className={`p-2 bg-soft-dol rounded-full text-white text-2xl button-dol`}
                        >
                            <IconDol library={`fa6`} icon={`FaFileImport`} />
                        </button>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            onChange([]);
                        }}
                        className={`p-2 bg-soft-dol rounded-full text-error text-2xl button-dol`}
                    >
                        <IconDol library={`io5`} icon={`IoTrash`} />
                    </button>
                </div>
                {!isEmpty(value) 
                    ?   <table className={`text-dol`}><tbody>
                            {value.map((record, RI) => 
                                <tr key={"audio_" + RI}>
                                    <td className={`p-2`}>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                set("selectedAudioIndex", RI);
                                                audioRef.current.src = value[RI].url;
                                                // audioRef.current.play();
                                            }}
                                            className={`button-dol rounded-full p-2 bg-dol text-2xl`}
                                        >
                                            <IconDol library={`fa6`} icon={`FaEye`}/>
                                        </button> 
                                    </td>
                                    <td className={`p-2 text-soft-dol max-w-40 truncate`}>
                                        <span>{record.title}</span>
                                    </td>
                                    <td className={`p-2 text-soft-dol`}>
                                        <span>{secondsToTime(record.duration)}</span>
                                    </td>
                                    <td className={`p-2 text-right`}>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onChange([...value.slice(0, RI), ...value.slice(RI + 1)])
                                            }}
                                            className={`button-dol rounded-full p-2 bg-dol text-2xl text-error`}
                                        >
                                            <IconDol library={`io5`} icon={`IoTrash`}/>
                                        </button> 
                                    </td>
                                </tr>
                            )}
                        </tbody></table>
                    :   <div className={`col-h-center gap-2 p-4 text-soft-dol`}>
                            <IconDol library={`fa6`} icon={`FaFileAudio`} className={`text-4xl`} />
                            <span className={`italic`}>Aucun audio</span>
                        </div>
                }
                <div className={`
                    ${!isNull(selectedAudioIndex) ? "translate-y-0" : "translate-y-full"}
                    ${deviceType !== "desktop" && "w-full"}
                    z-60 duration-300 fixed-h-center max-h-full bottom-0 col gap-4 overflow-y-auto bg-dol rounded-t-md 
                `}>
                    <div className={`sticky top-0 p-2 border-b border-dol bg-soft-dol z-30`}>
                        <div className={`row-full-center gap-2`}>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    inputMicrophoneRef.current.click();
                                }}
                                className={`p-2 bg-soft-dol rounded-full text-white text-2xl button-dol`}
                            >
                                <IconDol library={`fa6`} icon={`FaMicrophoneLines`} />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    inputDownloadRef.current.click();
                                }}
                                className={`p-2 bg-soft-dol rounded-full text-white text-2xl button-dol`}
                            >
                                <IconDol library={`fa6`} icon={`FaFileImport`} />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    onChange([...value.slice(0, selectedAudioIndex), ...value.slice(selectedAudioIndex + 1)])
                                    set("selectedAudioIndex", null);
                                }}
                                className={`p-2 bg-soft-dol rounded-full text-error text-2xl button-dol`}
                            >
                                <IconDol library={`io5`} icon={`IoTrash`} />
                            </button>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                                const newValue = [...value];
                                if (isEmpty(newValue[selectedAudioIndex].title)) {
                                    newValue[selectedAudioIndex].title = `Audio ${selectedAudioIndex + 1}`;
                                    onChange(newValue);
                                }
                                set("selectedAudioIndex", null);
                            }}
                            className={`absolute top-2 right-2 button-dol rounded-full p-2 bg-soft-dol text-2xl`}
                        >
                            <IconDol library={`io5`} icon={`IoClose`}/>
                        </button>
                    </div>
                        
                    <div className={`col gap-4 p-6`}>
                        <audio
                            ref={audioRef}
                            controls={true}
                            onLoadedMetadata={(e) => {
                                const newValue = [...value];
                                newValue[selectedAudioIndex] = { ...newValue[selectedAudioIndex], duration: e.target.duration };
                                onChange(newValue);
                            }} 
                            className={`w-full`}
                        >
                            {/* <source 
                            // src={selectedAudio?.url} 
                            // type={selectedAudio?.file.type} 
                            /> */}
                            Votre navigateur ne supporte pas la lecture audio.
                        </audio>
                        <InputDol
                            placeholder={`Titre de l'audio ...`}
                            value={selectedAudio?.title}
                            onChange={newState => {
                                const newValue = [...value];
                                newValue[selectedAudioIndex].title = newState;
                                onChange(newValue);
                            }}
                            className={`bg-dol rounded-md mx-2`}
                        />
                        <TextareaDol
                            placeholder={`Description de l'audio ...`}
                            value={selectedAudio?.description}
                            onChange={newState => {
                                const newValue = [...value];
                                newValue[selectedAudioIndex].description = newState;
                                onChange(newValue);
                            }}
                            className={`bg-dol rounded-md mx-2`}
                        />
                    </div>
                </div>
            </div>
        </LabelDol>
    );
};

AudiosDol.propTypes = propTypes;

export default AudiosDol;