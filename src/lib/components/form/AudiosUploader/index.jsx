import { FaFileAudio, FaFileImport, FaMicrophoneLines, FaTrashCan } from "react-icons/fa6";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { isNil, isEmpty } from "lodash";

import { useFile, useStates, useField, useVariantMerger } from "lib/hooks";
import { Popup, Button, Textarea, Input, Label } from "lib/components";
import { applyFunctionIfNotNil, locate, splitFileExtension } from "lib/utils";

import { propTypes } from "./props";

// TODO GPS points

export const AudiosUploader = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("AudiosUploader", props);

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
        accept = "audio/*",
    } = variantProps;

    const errors = (currentValue) => ({
        required: { 
            condition: required && isEmpty(currentValue),
            message: "Vous devez enregistrer au moins 1 audio."
        },
        min: { 
            condition: !isNil(min) && multiple && currentValue.length < min,
            message: `Vous devez enregistrer ${min} audios minimum.`
        },
        max: { 
            condition: !isNil(max) && multiple && currentValue.length > max,
            message: `Vous ne pouvez pas enregistrer plus de ${max} audios. Veuillez en supprimer.`
        },
        exact: { 
            condition: !isNil(exact) && multiple && currentValue.length !== exact,
            message: `Vous devez enregistrer exactement ${exact} audios.`
        },
    });

    const { currentValue, setValue, isFormSubmitting, isFormSubmitted, filteredErrors } = useField({ name, defaultValue, value, onChange, errors }); // multiple ? [] : null;

    const initialStates = {
        // isPanelOpen: false,
        isInputInCaptureMode: false,
        isAudioLoading: false,
        isAudioSelected: false, // from simple audio
        selectedAudioIndex: null, // for multiple audios
    };

    const { states, set } = useStates({ initialStates, debug: false });

    const { isPanelOpen, isInputInCaptureMode, isAudioLoading, isAudioSelected, selectedAudioIndex } = states;

    const inputRef = useRef(null);

    const audioRefs = useRef(multiple ? [] : null)

    const captureAudio = () => {
        set("isInputInCaptureMode", true);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const importAudio = () => {
        set("isInputInCaptureMode", false);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const deleteAudio = index => {
        if (!disabled && !readOnly && isFormSubmitting) {
            let newValue;

            if (multiple) {
                newValue = [...currentValue.slice(0, index), ...currentValue.slice(index + 1)];
                set("selectedAudioIndex", null);
            } else {
                newValue = null;
                set("isAudioSelected", false);
            }

            setValue(newValue);
        }
    }

    const selectAudio = index => {
        if (!disabled && !readOnly && isFormSubmitting) {
            if (multiple) {
                set("selectedAudioIndex", index);
            } else {
                set("isAudioSelected", true);
            }
        }
    };

    const { resizeImage } = useFile();

    const addAudio = async file => {
        if (!disabled && !readOnly && isFormSubmitting) {
            set("isAudioLoading", true);

            // const base64 = await resizeImage(file);
            const base64 = null;
        
            let gpsPoints = [null, null];

            if (isInputInCaptureMode) {
                locate(
                    coords => { gpsPoints = coords },
                    error => toast.error("Echec de géolocatisation de la capture.")
                );
            }

            const newAudio = { src: base64, gpsPoints, title: splitFileExtension(file.name)[0], description: "", capture: isInputInCaptureMode };
            const newValue = multiple ? [...currentValue, newAudio] : newAudio;
            setValue(newValue);
            set("isAudioLoading", false);
        }
    };

    const updateAudioInfo = (prop, value) => {
        if (!disabled && !readOnly && isFormSubmitting) {
            let newValue;

            if (multiple) {
                newValue = [...currentValue];
                newValue[selectedAudioIndex][prop] = value;
            } else {
                newValue = { ...currentValue, [prop]: value };
            }

            setValue(newValue);
        }
    };

    const closePopup = (index) => {
        if (multiple) {
            audioRefs.current[index].pause();
            audioRefs.current[index].currentTime = 0;
            set("selectedAudioIndex", null);
        } else {
            audioRefs.current.pause();
            audioRefs.current.currentTime = 0;
            set("isAudioSelected", false);
        }
    };

    const Audio = (audio, index) => {
        return (
            <>
                <input
                    name={name}
                    value={audio?.src}
                    onChange={() => {}}
                    hidden
                />
                <input
                    name={name}
                    value={audio?.capture}
                    onChange={() => {}}
                    hidden
                />
                <input
                    name={name}
                    value={audio?.gpsPoints?.[0]}
                    onChange={() => {}}
                    hidden
                />
                <input
                    name={name}
                    value={audio?.gpsPoints?.[1]}
                    onChange={() => {}}
                    hidden
                />
                <div { ...mergeProps("audio", props => ({
                    ...props,
                    onClick: e => {
                        selectAudio(index);
                        applyFunctionIfNotNil(props.onClick, e);
                    },
                    className: `self-start max-w-30 flex flex-col items-center gap-app-xs
                    rounded-app-md bg-strong-bg p-app-sm active:brightness-soft duration-100`
                }))}>
                    <FaFileAudio { ...mergeProps("img", props => ({
                        ...props,
                        className: `text-app-4xl text-medium-text`
                    }))} />
                    <div { ...mergeProps("title", props => ({
                        ...props,
                        className: "truncate text-app-xs text-medium-text italic"
                    }))}>
                        {audio?.title}
                    </div>
                </div>
            </>
        );
    };

    const AudioPopup = (audio, index) => {
        return (
            <Popup { ...mergeProps("Popup", props => ({
                closeButton: true,
                title: multiple ? `Audio ${index + 1}` : "Audio enregistré",
                zIndex: 60,
                ...props,
                close: () => {
                    closePopup(index)
                    applyFunctionIfNotNil(props.close);
                },
                isOpen: multiple ? selectedAudioIndex === index : isAudioSelected,
            }))}>
                <FaFileAudio { ...mergeProps("popupImg", props => ({
                    ...props,
                    className: `w-full text-app-6xl text-strong-text`
                }))} />
                 <audio { ...mergeProps("audioPlayer", props => ({
                    ...props,
                    ref: el => multiple ? (audioRefs.current[index] = el) : (audioRefs.current = el),
                    src: audio.src,
                    controls: true,
                    // onLoadedMetadata={(e) => {
                    //     const newValue = [...value];
                    //     newValue[selectedAudioIndex] = { ...newValue[selectedAudioIndex], duration: e.target.duration };
                    //     onChange(newValue);
                    // }} 
                    className: `w-full rounded-app-xl`
                 }))}></audio>
                <Input { ...mergeProps("TitleInput", props => ({
                    label: "Titre",
                    ...props,
                    name: name,
                    value: audio?.title,
                    onChange: value => {
                        updateAudioInfo("title", value);
                        applyFunctionIfNotNil(props.onChange, value);
                    }
                }))} />
                <Textarea { ...mergeProps("DescriptionTextarea", props => ({
                    label: "Description",
                    ...props,
                    name: name,
                    value: audio?.description,
                    onChange: value => {
                        updateAudioInfo("description", value);
                        applyFunctionIfNotNil(props.onChange, value);
                    }
                }))} />
                <Button { ...mergeProps("DeleteButton", props => ({
                    icon: FaTrashCan,
                    ...props,
                    className: `w-full`,
                    onClick: e => {
                        e.preventDefault();
                        deleteAudio(index);
                        applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                    }
                }))} >
                    Supprimer l&lsquo;audio
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
                accept={accept ?? "audio/*"} // let the dev choose an image type
                ref={inputRef}
                type={`file`}
                capture={isInputInCaptureMode}
                onChange={e => addAudio(e.target.files[0])}
                hidden
            />
            <div { ...mergeProps("audiosAndButtonContainer", props => ({
                ...props,
                className: "flex flex-col gap-app-sm w-full"
            }))}>
                <div { ...mergeProps("audiosContainer", props => ({
                    ...props,
                    className: `flex flex-wrap gap justify-center gap-app-xs p-app-xs
                    overflow-y-auto max-h-50 rounded-app-md bg-strong-bg inset-shadow-sm`
                }))}>
                    {!isEmpty(currentValue)
                        ?   (multiple 
                                ?   currentValue.map(Audio)
                                :   Audio(currentValue)
                            )
                        :   <div { ...mergeProps("emptyAudio", props => ({
                                ...props,
                                className: "italic text-medium-text text-app-base text-center truncate"
                            }))}>
                                Aucun audio enregistré
                            </div>
                    }
                   
                </div>
                <div  { ...mergeProps("buttonsContainer", props => ({
                    ...props,
                    className: "flex items-center gap-app-base",
                    // border-t pt-4 border-border
                }))}>
                    <Button { ...mergeProps("CaptureButton", props => ({
                        icon: FaMicrophoneLines,
                        loading: isInputInCaptureMode && isAudioLoading,
                        ...props,
                        disabled: isAudioLoading,
                        onClick: e => {
                            e.preventDefault();
                            captureAudio();
                            applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                        },
                        buttonProps: {
                            ...props.buttonProps,
                            className: "p-app-base rounded-app-xl text-app-lg",
                        }
                    }))} />
                    <Button { ...mergeProps("ImportButton", props => ({
                        icon: FaFileImport,
                        loading: !isInputInCaptureMode && isAudioLoading,
                        ...props,
                        disabled: isAudioLoading,
                        onClick: e => {
                            e.preventDefault();
                            importAudio();
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
                ?   currentValue.map(AudioPopup)
                :   AudioPopup(currentValue)
            }
        </Label>
    );
};

AudiosUploader.propTypes = propTypes;