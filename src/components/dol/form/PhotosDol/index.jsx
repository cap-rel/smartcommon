import { useEffect, useRef } from "react";
import { IconDol, InputDol, LabelDol, TextareaDol } from "../../../dol";
import { isEmpty, isNull, removeFileExtension, secondsToTime } from "../../../../globals/functions";
import { useNavigator, useStates } from "../../../hooks";
import { propTypes } from "./props";

export const PhotosDol = ({
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

    const { states, set } = useStates({
        selectedPhotoId: null,
        isImageFullScreen: false,
    }) 

    const { selectedPhotoId, isImageFullScreen } = states;

    const selectedPhoto = value[selectedPhotoId];

    const handlePhotosOnChange = (e) => {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        if (isNull(selectedPhotoId)) {
            onChange([...value, { file: file, url: url, title: "", description: "" }]);
            set("selectedPhotoId", value.length);                    
        } else {
            const newValue = [...value];
            newValue[selectedPhotoId].url = url;
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
                    accept={`image/*`}
                    capture={input.capture}
                    onChange={handlePhotosOnChange}
                />
            )}
            <div className={`border border-dol rounded-md col w-full max-w-120`}>
                <div className={`row-between-center bg-soft-dol p-2`}>
                    <div className={`row-v-center gap-2`}>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                inputCameraRef.current.click();
                            }}
                            className={`p-2 bg-soft-dol rounded-full text-white text-2xl button-dol`}
                        >
                            <IconDol library={`fa6`} icon={`FaCamera`} />
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
                                <tr key={"photo_" + RI}>
                                    <td className={`p-2`}>
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                set("selectedPhotoId", RI);
                                            }}
                                            className={`button-dol rounded-full p-2 bg-dol text-2xl`}
                                        >
                                            <IconDol library={`fa6`} icon={`FaEye`}/>
                                        </button> 
                                    </td>
                                    <td className={`p-2 text-soft-dol max-w-40 truncate`}>
                                        <span>{record.title}</span>
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
                            <IconDol library={`fa6`} icon={`FaFileImage`} className={`text-4xl`} />
                            <span className={`italic`}>Aucune photo</span>
                        </div>
                }
                <div className={`
                    ${!isNull(selectedPhotoId)  ? "translate-y-0" : "translate-y-full"}
                    ${deviceType !== "desktop" && "w-full"}
                    ${isImageFullScreen && "top-0"} 
                    fixed-h-center bottom-0
                    z-60 duration-300 max-h-full col gap-4 overflow-y-auto bg-dol rounded-t-md 
                `}>
                    <div className={`sticky top-0 p-2 border-b border-dol bg-soft-dol z-30`}>
                        <div className={`row-full-center gap-2`}>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    inputCameraRef.current.click();
                                }}
                                className={`p-2 bg-soft-dol rounded-full text-white text-2xl button-dol`}
                            >
                                <IconDol library={`fa6`} icon={`FaCamera`} />
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
                                    onChange([...value.slice(0, selectedPhotoId), ...value.slice(selectedPhotoId + 1)])
                                    set("selectedPhotoId", null);
                                }}
                                className={`p-2 bg-soft-dol rounded-full text-error text-2xl button-dol`}
                            >
                                <IconDol library={`io5`} icon={`IoTrash`} />
                            </button>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                const newValue = [...value];
                                if (isEmpty(newValue[selectedPhotoId].title)) {
                                    newValue[selectedPhotoId].title = `Photo ${selectedPhotoId + 1}`;
                                    onChange(newValue);
                                }
                                set("selectedPhotoId", null);
                            }}
                            className={`absolute top-2 right-2 button-dol rounded-full p-2 bg-soft-dol text-2xl`}
                        >
                            <IconDol library={`io5`} icon={`IoClose`}/>
                        </button>
                    </div>
                        
                    <div className={`col gap-4 p-6`}>
                        <div 
                            className={`${isImageFullScreen ? "fixed inset-0 z-40 bg-dol row-full-center" : "relative"}`}
                        >
                            <img src={selectedPhoto?.url} className={`max-h-full`}/>
                            <button 
                                onClick={(e) => { 
                                    e.preventDefault();
                                    set("isImageFullScreen", !isImageFullScreen);
                                }}
                                className={`p-2 rounded-full text-2xl button-dol absolute top-2 right-2 z-20 ${isImageFullScreen ? "bg-dol" : "bg-light-20 dark:bg-dark-20"}`}
                            >
                                <IconDol library={`fa`} icon={isImageFullScreen ? "FaCompressArrowsAlt" : "FaExpandArrowsAlt"} />
                            </button>
                        </div>
                        <InputDol
                            placeholder={`Titre de l'audio ...`}
                            value={selectedPhoto?.title}
                            onChange={newState => {
                                const newValue = [...value];
                                newValue[selectedPhotoId].title = newState;
                                onChange(newValue);
                            }}
                            className={`bg-dol rounded-md mx-2`}
                        />
                        <TextareaDol
                            placeholder={`Description de l'audio ...`}
                            value={selectedPhoto?.description}
                            onChange={newState => {
                                const newValue = [...value];
                                newValue[selectedPhotoId].description = newState;
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

PhotosDol.propTypes = propTypes;