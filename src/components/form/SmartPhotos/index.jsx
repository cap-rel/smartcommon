import { FaCamera, FaFileImage, FaFileImport, FaTrash, FaTrashCan } from "react-icons/fa6";
import { useFile, useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { Button, Overlay, Panel, Popup } from "../../others";
import { propTypes } from "./props";
import { applyFunctionIfNotNil, isEmpty, isNil, locate, splitFileExtension } from "../../../globals";
import { useRef } from "react";
import { Textarea } from "../Textarea";
import { Input } from "../Input";
import { Label } from "../Label";
import toast from "react-hot-toast";

// TODO GPS points

export const SmartPhotos = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("photos", props);

    const { extractedLabelProps, filteredProps } = useLabel(variantProps);

    const {
        label, help, icon, hasCopyButton, loading,

        required,
        disabled,
        readOnly,
        max,
        min,
        multiple,
        accept,
        name,
        defaultValue,
        value,
        onChange = () => {}
    } = filteredProps;

    const { currentValue, setValue } = useValue(defaultValue ?? (multiple ? [] : null), value, onChange);

    const { states, set } = useStates({
        // isPanelOpen: false,
        isInputInCaptureMode: false,
        isPhotoLoading: false,
        isPhotoSelected: false, // from simple photo
        selectedPhotoIndex: null, // for multiple photos
    });

    const { isPanelOpen, isInputInCaptureMode, isPhotoLoading, isPhotoSelected, selectedPhotoIndex } = states;

    // const selectedPhoto = multiple ? currentValue[selectedPhotoIndex] : currentValue;

    const inputRef = useRef(null);

    const capturePhoto = () => {
        set("isInputInCaptureMode", true);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const importPhoto = () => {
        set("isInputInCaptureMode", false);
        setTimeout(() => inputRef.current.click(), 0);
    };

    const deletePhoto = index => {
        let newValue;

        if (multiple) {
            newValue = [...currentValue.slice(0, index), ...currentValue.slice(index + 1)];
            set("selectedPhotoIndex", null);
        } else {
            newValue = null;
            set("isPhotoSelected", false);
        }

        setValue(newValue);
    }

    const selectPhoto = index => {
        if (multiple) {
            set("selectedPhotoIndex", index);
        } else {
            set("isPhotoSelected", true);
        }
    };

    const { resizeImage } = useFile();

    const addPhoto = async file => {
        set("isPhotoLoading", true);
        // setTimeout(() => {
            // const file = e.target.files[0];
            // const url = URL.createObjectURL(file);
            const base64 = await resizeImage(file);
        
            // if (isNull(selectedPhotoIndex)) {
            let gpsPoints = [null, null];

            if (isInputInCaptureMode) {
                locate(
                    coords => { gpsPoints = coords },
                    error => toast.error("Echec de géolocatisation de la capture.")
                );
            }

            const newPhoto = { src: base64, gpsPoints, title: splitFileExtension(file.name)[0], description: "", capture: isInputInCaptureMode };
            const newValue = multiple ? [...currentValue, newPhoto] : newPhoto;
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
    };

    const updatePhotoInfo = (prop, value) => {
        let newValue;

        if (multiple) {
            newValue = [...currentValue];
            newValue[selectedPhotoIndex][prop] = value;
        } else {
            newValue = { ...currentValue, [prop]: value };
        }

        setValue(newValue)
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
                    value={photo?.gpsPoints[0]}
                    onChange={() => {}}
                    hidden
                />
                <input
                    name={name}
                    value={photo?.gpsPoints[1]}
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
                    className: `self-start max-w-30 flex flex-col gap-app-xs
                    rounded-app-md bg-strong-bg p-app-sm active:brightness-soft duration-100`
                }))}>
                    <img { ...mergeProps("img", props => ({
                        ...props,
                        src: photo?.src,
                        className: "border border-border"
                    }))} />
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
                <img { ...mergeProps("popupImg", props => ({
                    ...props,
                    src: photo?.src,
                    className: `w-full border border-border`
                }))} />
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
                <Button { ...mergeProps("DeleteButton", props => ({
                    icon: <FaTrashCan />,
                    ...props,
                    className: `w-full`,
                    onClick: e => {
                        e.preventDefault();
                        deletePhoto(index);
                        applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                    }
                }))} >
                    Supprimer la photo
                </Button>
            </Popup>
        );
    }
    
    return (
        <Label
            { ...extractedLabelProps}
            mergeProps={mergeProps}
        >
            <input
                accept={accept ?? "image/*"} // let the dev choose an image type
                ref={inputRef}
                type={`file`}
                capture={isInputInCaptureMode}
                onChange={e => addPhoto(e.target.files[0])}
                hidden
            />
            {/* <Button { ...mergeProps("FloatingButton", props => ({
                icon: <FaCamera />,
                ...props,
                badge: multiple ? currentValue.length : (!isNil(currentValue) ? 1 : null),
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
                    className: `flex flex-wrap gap justify-center gap-app-xs p-app-xs
                    overflow-y-auto max-h-50 rounded-app-md bg-strong-bg inset-shadow-sm`
                }))}>
                    {!isEmpty(currentValue)
                        ?   (multiple 
                                ?   currentValue.map(Photo)
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
                        icon: <FaCamera />,
                        loading: isInputInCaptureMode && isPhotoLoading,
                        ...props,
                        disabled: isPhotoLoading,
                        onClick: e => {
                            e.preventDefault();
                            capturePhoto();
                            applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
                        },
                        buttonProps: {
                            ...props.buttonProps,
                            className: "p-app-base rounded-app-xl text-app-lg",
                        }
                    }))} />
                    <Button { ...mergeProps("ImportButton", props => ({
                        icon: <FaFileImport />,
                        loading: !isInputInCaptureMode && isPhotoLoading,
                        ...props,
                        disabled: isPhotoLoading,
                        onClick: e => {
                            e.preventDefault();
                            importPhoto();
                            applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
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
                ?   currentValue.map(PhotoPopup)
                :   PhotoPopup(currentValue)
            }
        </Label>
    );
};

SmartPhotos.propTypes = propTypes;