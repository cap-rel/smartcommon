import { FaCamera, FaFileImport, FaTrashCan, FaImage } from "react-icons/fa6";
import { useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { GiSaveArrow } from "react-icons/gi";
import { isNil, isEmpty } from "lodash";

import { useFile, useStates, useField, useVariantMerger } from "lib/hooks";
import { Popup, Button, Label, Input, Textarea } from "lib/components";
import { applyFunctionIfNotNil, locate, splitFileExtension } from "lib/utils";

import { propTypes } from "./props";

export const PhotosUploader = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("PhotosUploader", props);

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
        accept = "image/*",

        compressOptions,
    } = variantProps;

    const errors = (currentValue) => ({
        required: { 
            condition: required && isEmpty(currentValue),
            message: "Vous devez prendre au moins 1 photo."
        },
        min: {
            condition: !isNil(min) && multiple && (currentValue?.length ?? 0) < min,
            message: `Vous devez prendre ${min} photos minimum.`
        },
        max: {
            condition: !isNil(max) && multiple && (currentValue?.length ?? 0) > max,
            message: `Vous ne pouvez pas prendre plus de ${max} photos. Veuillez en supprimer.`
        },
        exact: {
            condition: !isNil(exact) && multiple && (currentValue?.length ?? 0) !== exact,
            message: `Vous devez prendre exactement ${exact} photos.`
        },
    });

    const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors });

    const initialStates = {
        // isPanelOpen: false,
        isInputInCaptureMode: false,
        isPhotoLoading: false,
        isPhotoSelected: false, // from simple photo
        selectedPhotoIndex: null, // for multiple photos
    };

    const { states, set } = useStates({ initialStates, debug: false });

    const { isPanelOpen, isInputInCaptureMode, isPhotoLoading, isPhotoSelected, selectedPhotoIndex } = states;

    // const selectedPhoto = multiple ? currentValue[selectedPhotoIndex] : currentValue;

    const inputRef = useRef(null);

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

    const capturePhoto = () => {
        set("isInputInCaptureMode", true);
        // Clear any pending timeout to avoid race conditions on rapid clicks
        if (inputClickTimeoutRef.current) {
            clearTimeout(inputClickTimeoutRef.current);
        }
        inputClickTimeoutRef.current = setTimeout(() => inputRef.current.click(), 0);
    };

    const importPhoto = () => {
        set("isInputInCaptureMode", false);
        // Clear any pending timeout to avoid race conditions on rapid clicks
        if (inputClickTimeoutRef.current) {
            clearTimeout(inputClickTimeoutRef.current);
        }
        inputClickTimeoutRef.current = setTimeout(() => inputRef.current.click(), 0);
    };

    const deletePhoto = index => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            let newValue;

            if (multiple) {
                newValue = [...(currentValue ?? []).slice(0, index), ...(currentValue ?? []).slice(index + 1)];
                set("selectedPhotoIndex", null);
            } else {
                newValue = null;
                set("isPhotoSelected", false);
            }

            setValue(newValue);
        }
    }

    const selectPhoto = index => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            if (multiple) {
                set("selectedPhotoIndex", index);
            } else {
                set("isPhotoSelected", true);
            }
        }
    };

    const { resizeImage } = useFile();

    const addPhoto = async file => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            set("isPhotoLoading", true);
            // setTimeout(() => {
                // const file = e.target.files[0];
                // const url = URL.createObjectURL(file);
                const base64 = await resizeImage(file, compressOptions);
            
                // if (isNull(selectedPhotoIndex)) {
                let gpsPoints = [null, null];

                if (isInputInCaptureMode) {
                    locate(
                        coords => { gpsPoints = coords },
                        error => toast.error("Echec de géolocatisation de la capture.")
                    );
                }

                const newPhoto = { src: base64, gpsPoints, title: splitFileExtension(file.name)[0], description: "", capture: isInputInCaptureMode };
                const newValue = multiple ? [...(currentValue ?? []), newPhoto] : newPhoto;
                setValue(newValue);
                // set("selectedPhotoIndex", localValue.length);                    
                // } else {
                //     const newPhotos = [...localValue];>
                //     newPhotos[selectedPhotoIndex].url = url;
                //     set("localValue", newPhotos);    
                // }
                set("isPhotoLoading", false);
                // return () => URL.revokeObjectURL(url);
            // }, 1000);
        }
    };

    const updatePhotoInfo = (prop, value) => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            let newValue;

            if (multiple) {
                newValue = [...(currentValue ?? [])];
                if (newValue[selectedPhotoIndex]) {
                    newValue[selectedPhotoIndex][prop] = value;
                }
            } else {
                newValue = { ...currentValue, [prop]: value };
            }

            setValue(newValue);
        }
    };

    const Photo = (photo, index) => {
        return (
            <>
                <input
                    name={name}
                    value={photo?.src}
                    onChange={() => {}}
                    hidden
                />
                <input
                    name={name}
                    value={photo?.capture}
                    onChange={() => {}}
                    hidden
                />
                <input
                    name={name}
                    value={photo?.gpsPoints?.[0]}
                    onChange={() => {}}
                    hidden
                />
                <input
                    name={name}
                    value={photo?.gpsPoints?.[1]}
                    onChange={() => {}}
                    hidden
                />
                <div { ...mergeProps("photo", props => ({
                    ...props,
                    onClick: e => {
                        e.preventDefault();
                        selectPhoto(index);
                        applyFunctionIfNotNil(props.onClick, e);
                    },
                    className: `self-start max-w-30 flex flex-col gap-app-xs ${!disabled && "active:brightness-soft"}
                    rounded-app-md bg-strong-bg p-app-sm duration-(--quick)`
                }))}>
                    {photo?.src
                        ? <img { ...mergeProps("img", props => ({
                            ...props,
                            src: photo?.src,
                            className: "border border-border"
                        }))} />
                        : <FaImage className="text-soft-text text-[80px]" />
                    }
                    
                    <div { ...mergeProps("title", props => ({
                        ...props,
                        className: "truncate text-app-xs text-medium-text italic text-center"
                    }))}>
                        {photo?.title}
                    </div>
                </div>
            </>
        );
    };

    const PhotoPopup = (photo, index) => {
        return (
            <Popup { ...mergeProps("Popup", props => ({
                closeButton: true,
                title: multiple ? `Photo ${index + 1}` : "Photo enregistrée",
                zIndex: 60,
                ...props,
                close: () => {
                    if (multiple) {
                        set("selectedPhotoIndex", null);
                    } else {
                        set("isPhotoSelected", false);
                    }
                    applyFunctionIfNotNil(props.close);
                },
                isOpen: multiple ? selectedPhotoIndex === index : isPhotoSelected,
            }))}>
                <div className="relative w-full">
                    <Button { ...mergeProps("DeleteButton", props => ({
                        icon: FaTrashCan,
                        ...props,
                        onClick: e => {
                            e.preventDefault();
                            deletePhoto(index);
                            applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                        },
                        buttonProps: {
                            ...props.buttonProps,
                            className: `absolute bottom-1 right-1 bg-soft-bg text-white bg-primary p-app-sm rounded-app-xl`
                        },
                        iconProps: {
                            ...props.iconProps,
                            className: "text-app-lg "
                        }
                    }))} />
                    {photo?.src
                    ? <img { ...mergeProps("popupImg", props => ({
                        ...props,
                        src: photo?.src,
                        className: `w-full border border-border`
                    }))} />
                    : <FaImage className="w-full text-soft-text text-[80px]" />
                }
                </div>
                <Input { ...mergeProps("TitleInput", props => ({
                    label: "Titre",
                    ...props,
                    name: name,
                    value: photo?.title,
                    onChange: value => {
                        updatePhotoInfo("title", value);
                        applyFunctionIfNotNil(props.onChange, value);
                    }
                }))} />
                <Textarea { ...mergeProps("DescriptionTextarea", props => ({
                    label: "Description",
                    ...props,
                    name: name,
                    value: photo?.description,
                    onChange: value => {
                        updatePhotoInfo("description", value);
                        applyFunctionIfNotNil(props.onChange, value);
                    }
                }))} />
                {/* <div className="flex gap-app-xs items-center"> */}
                    <Button { ...mergeProps("SaveButton", props => ({
                        label: "Enregistrez",
                        icon: GiSaveArrow,
                        ...props,
                        onClick: e => {
                            e.preventDefault();
                            if (multiple) {
                                set("selectedPhotoIndex", null);
                            } else {
                                set("isPhotoSelected", false);
                            }
                            applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                        },
                        buttonProps: {
                            ...props.buttonProps,
                            className: `bg-success`,
                        },
                        iconProps: {
                            ...props.iconProps,
                            className: "text-app-xl"
                        }
                    }))} />
                {/* </div> */}
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
                accept={accept} // let the dev choose an image type
                ref={inputRef}
                type={`file`}
                capture={isInputInCaptureMode}
                onChange={e => addPhoto(e.target.files[0])}
                hidden
            />
            {/* <Button { ...mergeProps("FloatingButton", props => ({
                icon: <FaCamera />,
                ...props,
                badge: multiple ? (currentValue?.length ?? 0) : (!isNil(currentValue) ? 1 : null),
                buttonProps: {
                    ...props.buttonProps,
                    className: "p-app-base fixed right-app-base bottom-app-base",
                    onClick: e => {
                        e.preventDefault();
                        applyFunctionIfNotNil(props.buttonProps?.onClick, e);
                        set("isPanelOpen", true);
                    }
                }
            }))} /> */}

            {/* <Panel { ...mergeProps("Panel", props => ({
                ...props,
                isOpen: isPanelOpen,
                close: () => {
                    applyFunctionIfNotNil(props.close);
                    set("isPanelOpen", false)
                },
                panelProps: {
                    ...props.panelProps,
                    className: ""
                }
            }))}> */}
            <div { ...mergeProps("photosAndButtonContainer", props => ({
                ...props,
                className: "flex flex-col gap-app-sm w-full"
            }))}>
                <div { ...mergeProps("photosContainer", props => ({
                    ...props,
                    className: `flex flex-wrap justify-center gap-app-xs p-app-xs ${disabled && "brightness-soft"}
                    overflow-y-auto max-h-50 rounded-app-md bg-strong-bg inset-shadow-sm`
                }))}>
                    {!isEmpty(currentValue)
                        ?   (multiple
                                ?   (currentValue ?? []).map(Photo)
                                :   Photo(currentValue)
                            )
                        :   <div { ...mergeProps("emptyPhoto", props => ({
                                ...props,
                                className: "italic text-medium-text text-app-base text-center truncate"
                            }))}>
                                Aucune photo enregistrée
                            </div>
                    }
                   
                </div>
                <div  { ...mergeProps("buttonsContainer", props => ({
                    ...props,
                    className: "flex items-center gap-app-base",
                    // border-t pt-4 border-border
                }))}>
                    <Button { ...mergeProps("CaptureButton", props => ({
                        icon: FaCamera,
                        loading: isInputInCaptureMode && isPhotoLoading,
                        ...props,
                        disabled: disabled || isPhotoLoading,
                        onClick: e => {
                            e.preventDefault();
                            capturePhoto();
                            applyFunctionIfNotNil(props.onClick, e);
                        },
                        buttonProps: {
                            ...props.buttonProps,
                            className: "p-app-base rounded-app-xl text-app-lg",
                        }
                    }))} />
                    <Button { ...mergeProps("ImportButton", props => ({
                        icon: FaFileImport,
                        loading: !isInputInCaptureMode && isPhotoLoading,
                        ...props,
                        disabled: disabled || isPhotoLoading,
                        onClick: e => {
                            e.preventDefault();
                            importPhoto();
                            applyFunctionIfNotNil(props.onClick, e);
                        },
                        buttonProps: {
                            ...props.buttonProps,
                            className: "p-app-base bg-secondary rounded-app-xl text-app-lg",
                        }
                    }))} />
                </div>
            </div>
            {/* </Panel> */}

            {multiple
                ?   (currentValue ?? []).map(PhotoPopup)
                :   PhotoPopup(currentValue)
            }
        </Label>
    );
};

PhotosUploader.propTypes = propTypes;