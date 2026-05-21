import { FaFileImport, FaFileVideo, FaTrashCan, FaVideo } from "react-icons/fa6";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { isNil, isEmpty } from "lodash";

import { useFile, useStates, useField, useVariantMerger } from "lib/hooks";
import { Popup, Textarea, Button, Input, Label } from "lib/components";
import { applyFunctionIfNotNil, locate, splitFileExtension } from "lib/utils";

import { DEFAULT_LABELS, propTypes } from "./props";

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

        labels: userLabels = {},
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    const errors = (currentValue) => ({
        required: {
            condition: required && isEmpty(currentValue),
            message: labels.requiredError,
        },
        min: {
            condition: !isNil(min) && multiple && (currentValue?.length ?? 0) < min,
            message: labels.minError(min),
        },
        max: {
            condition: !isNil(max) && multiple && (currentValue?.length ?? 0) > max,
            message: labels.maxError(max),
        },
        exact: {
            condition: !isNil(exact) && multiple && (currentValue?.length ?? 0) !== exact,
            message: labels.exactError(exact),
        },
    });

    const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors });

    const initialStates = {
        // isPanelOpen: false,
        isInputInCaptureMode: false,
        isVideoLoading: false,
        isVideoSelected: false, // from simple video
        selectedVideoIndex: null, // for multiple videos
    };

    const { states, set } = useStates({ initialStates, debug: false });

    const { isPanelOpen, isInputInCaptureMode, isVideoLoading, isVideoSelected, selectedVideoIndex } = states;

    const inputRef = useRef(null);

    const videosRef = useRef(multiple ? [] : null)

    // Ref to track input click timeout for proper cleanup
    const inputClickTimeoutRef = useRef(null);

    // Cleanup timeout on unmount to prevent memory leaks and setState on unmounted component
    useEffect(() => {
        return () => {
            if (inputClickTimeoutRef.current) {
                clearTimeout(inputClickTimeoutRef.current);
            }
        };
    }, []);

    const captureVideo = () => {
        set("isInputInCaptureMode", true);
        // Clear any pending timeout to avoid race conditions on rapid clicks
        if (inputClickTimeoutRef.current) {
            clearTimeout(inputClickTimeoutRef.current);
        }
        inputClickTimeoutRef.current = setTimeout(() => inputRef.current.click(), 0);
    };

    const importVideo = () => {
        set("isInputInCaptureMode", false);
        // Clear any pending timeout to avoid race conditions on rapid clicks
        if (inputClickTimeoutRef.current) {
            clearTimeout(inputClickTimeoutRef.current);
        }
        inputClickTimeoutRef.current = setTimeout(() => inputRef.current.click(), 0);
    };

    const deleteVideo = index => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            let newValue;

            if (multiple) {
                newValue = [...(currentValue ?? []).slice(0, index), ...(currentValue ?? []).slice(index + 1)];
                set("selectedVideoIndex", null);
            } else {
                newValue = null;
                set("isVideoSelected", false);
            }

            setValue(newValue);
        }
    }

    const selectVideo = index => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            if (multiple) {
                set("selectedVideoIndex", index);
            } else {
                set("isVideoSelected", true);
            }
        }
    };

    const { resizeImage } = useFile();

    const addVideo = async file => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            set("isVideoLoading", true);

            // const base64 = await resizeImage(file);
            const base64 = null;
        
            let gpsPoints = [null, null];

            if (isInputInCaptureMode) {
                locate(
                    coords => { gpsPoints = coords },
                    error => toast.error(labels.geolocationError)
                );
            }

            const newVideo = { src: base64, gpsPoints, title: splitFileExtension(file.name)[0], description: "", capture: isInputInCaptureMode };
            const newValue = multiple ? [...(currentValue ?? []), newVideo] : newVideo;
            setValue(newValue);
            set("isVideoLoading", false);
        }
    };

    const updateVideoInfo = (prop, value) => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            let newValue;

            if (multiple) {
                newValue = [...(currentValue ?? [])];
                if (newValue[selectedVideoIndex]) {
                    newValue[selectedVideoIndex][prop] = value;
                }
            } else {
                newValue = { ...currentValue, [prop]: value };
            }

            setValue(newValue);
        }
    };

    const closePopup = (index) => {
        if (multiple) {
            videosRef.current?.[index]?.pause?.();
            if (videosRef.current?.[index]) {
                videosRef.current[index].currentTime = 0;
            }
            set("selectedVideoIndex", null);
        } else {
            videosRef.current?.pause?.();
            if (videosRef.current) {
                videosRef.current.currentTime = 0;
            }
            set("isVideoSelected", false);
        }
    };

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
                title: multiple ? labels.videoPopupTitle(index) : labels.videoPopupTitleSingle,
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
                    src: video?.src,
                    controls: true,
                    // onLoadedMetadata={(e) => {
                    //     const newValue = [...value];
                    //     newValue[selectedVideoIndex] = { ...newValue[selectedVideoIndex], duration: e.target.duration };
                    //     onChange(newValue);
                    // }} 
                    className: `w-full rounded-app-md border border-border`
                 }))}></video>
                <Input { ...mergeProps("TitleInput", props => ({
                    label: labels.titleField,
                    ...props,
                    name: name,
                    value: video?.title,
                    onChange: value => {
                        updateVideoInfo("title", value);
                        applyFunctionIfNotNil(props.onChange, value);
                    }
                }))} />
                <Textarea { ...mergeProps("DescriptionTextarea", props => ({
                    label: labels.descriptionField,
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
                    {labels.deleteButton}
                </Button>
            </Popup>
        );
    }
    
    return (
        <Label
            { ...variantProps}
            showErrors={isFormSubmitted}
            errors={filteredErrors}
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
                                ?   (currentValue ?? []).map(Video)
                                :   Video(currentValue)
                            )
                        :   <div { ...mergeProps("emptyVideo", props => ({
                                ...props,
                                className: "italic text-medium-text text-app-base text-center truncate"
                            }))}>
                                {labels.emptyState}
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
                ?   (currentValue ?? []).map(VideoPopup)
                :   VideoPopup(currentValue)
            }
        </Label>
    );
};

VideosUploader.propTypes = propTypes;