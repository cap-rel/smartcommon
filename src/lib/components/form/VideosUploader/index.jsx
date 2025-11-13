import { FaCamera, FaFileAudio, FaFileImage, FaFileImport, FaFileVideo, FaMicrophoneLines, FaTrash, FaTrashCan, FaVideo } from "react-icons/fa6";
import { useFile, useStates, useLocalValue, useVariantMerger } from "../../../hooks";
import { Panel, Popup } from "../../main";
import { Overlay } from "../../others";
import { Button } from "../../little";
import { propTypes } from "./props";
import { applyFunctionIfNotNil, isEmpty, isNil, locate, splitFileExtension } from "../../../utils";
import { useEffect, useRef } from "react";
import { Textarea } from "../Textarea";
import { Input } from "../Input";
import { Label } from "../tools/Label";
import toast from "react-hot-toast";

// TODO GPS points

export const VideosUploader = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("VideosUploader", props);

    const {
        id,
        name,
        value,
        defaultValue,
        onChange = () => {},

        required,
        disabled,
        readOnly,
        min,
        exact,
        max,

        multiple,
        accept = "video/*",

        onError = () => {},
    } = variantProps;

    const { currentValue, setValue } = useLocalValue(defaultValue ?? (multiple ? [] : null), value, onChange);

    const { states, set } = useStates({
        // isPanelOpen: false,
        isInputInCaptureMode: false,
        isVideoLoading: false,
        isVideoSelected: false, // from simple video
        selectedVideoIndex: null, // for multiple videos
    });

    const { isPanelOpen, isInputInCaptureMode, isVideoLoading, isVideoSelected, selectedVideoIndex } = states;

    const inputRef = useRef(null);

    const videosRef = useRef(multiple ? [] : null)

    const captureVideo = () => {
        set("isInputInCaptureMode", true);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const importVideo = () => {
        set("isInputInCaptureMode", false);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const deleteVideo = index => {
        if (!disabled && !readOnly) {
            let newValue;

            if (multiple) {
                newValue = [...currentValue.slice(0, index), ...currentValue.slice(index + 1)];
                set("selectedVideoIndex", null);
            } else {
                newValue = null;
                set("isVideoSelected", false);
            }

            setValue(newValue);
        }
    }

    const selectVideo = index => {
        if (!disabled && !readOnly) {
            if (multiple) {
                set("selectedVideoIndex", index);
            } else {
                set("isVideoSelected", true);
            }
        }
    };

    const { resizeImage } = useFile();

    const addVideo = async file => {
        if (!disabled && !readOnly) {
            set("isVideoLoading", true);

            // const base64 = await resizeImage(file);
            const base64 = null;
        
            let gpsPoints = [null, null];

            if (isInputInCaptureMode) {
                locate(
                    coords => { gpsPoints = coords },
                    error => toast.error("Echec de géolocatisation de la capture.")
                );
            }

            const newVideo = { src: base64, gpsPoints, title: splitFileExtension(file.name)[0], description: "", capture: isInputInCaptureMode };
            const newValue = multiple ? [...currentValue, newVideo] : newVideo;
            setValue(newValue);
            set("isVideoLoading", false);
        }
    };

    const updateVideoInfo = (prop, value) => {
        if (!disabled && !readOnly) {
            let newValue;

            if (multiple) {
                newValue = [...currentValue];
                newValue[selectedVideoIndex][prop] = value;
            } else {
                newValue = { ...currentValue, [prop]: value };
            }

            setValue(newValue);
        }
    };

    const closePopup = (index) => {
        if (multiple) {
            videosRef.current[index].pause();
            videosRef.current[index].currentTime = 0;
            set("selectedVideoIndex", null);
        } else {
            videosRef.current.pause();
            videosRef.current.currentTime = 0;
            set("isVideoSelected", false);
        }
    };
    
    const errors = {
        required: { 
            condition: required && isEmpty(currentValue),
            message: "Vous devez enregistrer au moins 1 vidéo."
        },
        min: { 
            condition: !isNil(min) && multiple && currentValue.length < min,
            message: `Vous devez prendre ${min} vidéos minimum.`
        },
        max: { 
            condition: !isNil(max) && multiple && currentValue.length > max,
            message: `Vous ne pouvez pas prendre plus de ${max} vidéos. Veuillez en supprimer.`
        },
        exact: { 
            condition: !isNil(exact) && multiple && currentValue.length !== exact,
            message: `Vous devez prendre exactement ${exact} vidéos.`
        },
    };

    useEffect(() => {
        Object.entries(errors).forEach(([errorKey, error]) => onError(`${id}-${errorKey}`, error.condition))
    }, [currentValue]);

    const Video = (video, index) => {
        return (
            <>
                <input
                    name={name}
                    value={video?.src}
                    onChange={() => {}}
                    hidden
                />
                <input
                    name={name}
                    value={video?.capture}
                    onChange={() => {}}
                    hidden
                />
                <input
                    name={name}
                    value={video?.gpsPoints?.[0]}
                    onChange={() => {}}
                    hidden
                />
                <input
                    name={name}
                    value={video?.gpsPoints?.[1]}
                    onChange={() => {}}
                    hidden
                />
                <div { ...mergeProps("video", props => ({
                    ...props,
                    onClick: e => {
                        e.preventDefault();
                        selectVideo(index);
                        applyFunctionIfNotNil(props.onClick, e);
                    },
                    className: `self-start max-w-30 flex flex-col items-center gap-app-xs
                    rounded-app-md bg-strong-bg p-app-sm active:brightness-soft duration-100`
                }))}>
                    <FaFileVideo { ...mergeProps("img", props => ({
                        ...props,
                        className: `text-app-4xl text-medium-text`
                    }))} />
                    <div { ...mergeProps("title", props => ({
                        ...props,
                        className: "truncate text-app-xs text-medium-text italic"
                    }))}>
                        {video?.title}
                    </div>
                </div>
            </>
        );
    };

    const VideoPopup = (video, index) => {
        return (
            <Popup { ...mergeProps("Popup", props => ({
                closeButton: true,
                title: multiple ? `Vidéo ${index + 1}` : "Vidéo enregistré",
                zIndex: 60,
                ...props,
                close: () => {
                    closePopup(index)
                    applyFunctionIfNotNil(props.close);
                },
                isOpen: multiple ? selectedVideoIndex === index : isVideoSelected,
            }))}>
                <video { ...mergeProps("videoPlayer", props => ({
                    ...props,
                    ref: el => multiple ? (videosRef.current[index] = el) : (videosRef.current = el),
                    src: video.src,
                    controls: true,
                    // onLoadedMetadata={(e) => {
                    //     const newValue = [...value];
                    //     newValue[selectedVideoIndex] = { ...newValue[selectedVideoIndex], duration: e.target.duration };
                    //     onChange(newValue);
                    // }} 
                    className: `w-full rounded-app-md border border-border`
                 }))}></video>
                <Input { ...mergeProps("TitleInput", props => ({
                    label: "Titre",
                    ...props,
                    name: name,
                    value: video?.title,
                    onChange: value => {
                        updateVideoInfo("title", value);
                        applyFunctionIfNotNil(props.onChange, value);
                    }
                }))} />
                <Textarea { ...mergeProps("DescriptionTextarea", props => ({
                    label: "Description",
                    ...props,
                    name: name,
                    value: video?.description,
                    onChange: value => {
                        updateVideoInfo("description", value);
                        applyFunctionIfNotNil(props.onChange, value);
                    }
                }))} />
                <Button { ...mergeProps("DeleteButton", props => ({
                    icon: FaTrashCan,
                    ...props,
                    className: `w-full`,
                    onClick: e => {
                        e.preventDefault();
                        deleteVideo(index);
                        applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                    }
                }))} >
                    Supprimer la vidéo
                </Button>
            </Popup>
        );
    }
    
    return (
        <Label
            { ...variantProps}
            errors={errors}
            mergeProps={mergeProps}
        >
            <input
                accept={accept ?? "video/*"} // let the dev choose an image type
                ref={inputRef}
                type={`file`}
                capture={isInputInCaptureMode}
                onChange={e => addVideo(e.target.files[0])}
                hidden
            />
            <div { ...mergeProps("videosAndButtonContainer", props => ({
                ...props,
                className: "flex flex-col gap-app-sm w-full"
            }))}>
                <div { ...mergeProps("videosContainer", props => ({
                    ...props,
                    className: `flex flex-wrap gap justify-center gap-app-xs p-app-xs
                    overflow-y-auto max-h-50 rounded-app-md bg-strong-bg inset-shadow-sm`
                }))}>
                    {!isEmpty(currentValue)
                        ?   (multiple 
                                ?   currentValue.map(Video)
                                :   Video(currentValue)
                            )
                        :   <div { ...mergeProps("emptyVideo", props => ({
                                ...props,
                                className: "italic text-medium-text text-app-base text-center truncate"
                            }))}>
                                Aucune vidéo enregistrée
                            </div>
                    }
                   
                </div>
                <div  { ...mergeProps("buttonsContainer", props => ({
                    ...props,
                    className: "flex items-center gap-app-base",
                    // border-t pt-4 border-border
                }))}>
                    <Button { ...mergeProps("CaptureButton", props => ({
                        icon: FaVideo,
                        loading: isInputInCaptureMode && isVideoLoading,
                        ...props,
                        disabled: isVideoLoading,
                        onClick: e => {
                            e.preventDefault();
                            captureVideo();
                            applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                        },
                        buttonProps: {
                            ...props.buttonProps,
                            className: "p-app-base rounded-app-xl text-app-lg",
                        }
                    }))} />
                    <Button { ...mergeProps("ImportButton", props => ({
                        icon: FaFileImport,
                        loading: !isInputInCaptureMode && isVideoLoading,
                        ...props,
                        disabled: isVideoLoading,
                        onClick: e => {
                            e.preventDefault();
                            importVideo();
                            applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                        },
                        buttonProps: {
                            ...props.buttonProps,
                            className: "p-app-base bg-secondary rounded-app-xl text-app-lg",
                        }
                    }))} />
                </div>
            </div>

            {multiple 
                ?   currentValue.map(VideoPopup)
                :   VideoPopup(currentValue)
            }
        </Label>
    );
};

VideosUploader.propTypes = propTypes;