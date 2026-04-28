import { FaCamera, FaFileImport, FaTrashCan, FaImage } from "react-icons/fa6";
import { useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { GiSaveArrow } from "react-icons/gi";
import { isNil, isEmpty } from "lodash";

import { useFile, useStates, useField, useVariantMerger, useUpload } from "lib/hooks";
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

        // Output format:
        //   - "base64" (default, legacy): inlines a base64 string in value.src
        //   - "blob": keeps a Blob+previewUrl in value, caller assembles
        //     the upload itself (used by dsd today, kept for compat)
        //   - "upload": POSTs each photo to the smartauth /upload route
        //     and stores the returned upload_id in value.uploadId. The
        //     business module then references that id from its own JSON
        //     payload (server-side: SmartAuth\Api\UploadHelper).
        outputFormat = "base64",

        // For outputFormat="upload" only: optional override of the
        // upload endpoint path (default: "upload"). Useful when the
        // module re-exposes the route under its own prefix.
        uploadEndpoint,

        // For outputFormat="upload" only: optional callback invoked
        // when an upload fails. Receives the underlying error.
        onUploadError,
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

    // Cleanup preview URLs on unmount (blob and upload modes)
    useEffect(() => {
        return () => {
            if ((outputFormat === "blob" || outputFormat === "upload") && currentValue) {
                const photos = multiple ? (currentValue ?? []) : [currentValue];
                photos.forEach(photo => {
                    if (photo?.previewUrl) {
                        URL.revokeObjectURL(photo.previewUrl);
                    }
                });
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
            let photoToDelete;

            if (multiple) {
                photoToDelete = (currentValue ?? [])[index];
                newValue = [...(currentValue ?? []).slice(0, index), ...(currentValue ?? []).slice(index + 1)];
                set("selectedPhotoIndex", null);
            } else {
                photoToDelete = currentValue;
                newValue = null;
                set("isPhotoSelected", false);
            }

            // Revoke preview URL to free memory (blob and upload modes).
            if (photoToDelete?.previewUrl) {
                URL.revokeObjectURL(photoToDelete.previewUrl);
            }

            // Best-effort cleanup of the staged upload server-side.
            // Failure is non-fatal: the staging directory is GC'd on TTL.
            if (outputFormat === "upload" && photoToDelete?.uploadId) {
                cancelUpload(photoToDelete.uploadId).catch(err => {
                    console.warn("PhotosUploader: failed to cancel staged upload", err);
                });
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
    const { uploadFile, cancelUpload } = useUpload({ endpoint: uploadEndpoint });

    const addPhoto = async file => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            set("isPhotoLoading", true);

            let gpsPoints = [null, null];

            if (isInputInCaptureMode) {
                locate(
                    coords => { gpsPoints = coords },
                    error => toast.error("Echec de géolocatisation de la capture.")
                );
            }

            const title = splitFileExtension(file.name)[0];
            let newPhoto;

            try {
                if (outputFormat === "upload") {
                    // Upload mode: POST the binary to smartauth /upload,
                    // keep an upload_id for the form payload and a local
                    // previewUrl for rendering. The business module then
                    // references newPhoto.uploadId from its own JSON
                    // payload. Server-side, it consumes the staged file
                    // via SmartAuth\Api\UploadHelper::consumeUpload().
                    const previewUrl = URL.createObjectURL(file);
                    let uploadResult;
                    try {
                        uploadResult = await uploadFile(file);
                    } catch (err) {
                        URL.revokeObjectURL(previewUrl);
                        // Always log: silent failures hide regressions.
                        console.error("PhotosUploader upload failed:", err);
                        if (onUploadError) {
                            onUploadError(err);
                        } else {
                            toast.error("Echec de l'envoi de la photo.");
                        }
                        return;
                    }
                    newPhoto = {
                        uploadId: uploadResult?.upload_id,
                        previewUrl,
                        gpsPoints,
                        title,
                        description: "",
                        capture: isInputInCaptureMode,
                        mimeType: uploadResult?.mime ?? file.type,
                        filename: uploadResult?.filename ?? file.name,
                        size: uploadResult?.size,
                        sha256: uploadResult?.sha256,
                    };
                } else if (outputFormat === "blob") {
                    // Blob mode: store original file/blob with preview URL
                    const previewUrl = URL.createObjectURL(file);
                    newPhoto = {
                        blob: file,
                        previewUrl,
                        gpsPoints,
                        title,
                        description: "",
                        capture: isInputInCaptureMode,
                        mimeType: file.type,
                        filename: file.name
                    };
                } else {
                    // Base64 mode: legacy behavior
                    const base64 = await resizeImage(file, compressOptions);
                    newPhoto = {
                        src: base64,
                        gpsPoints,
                        title,
                        description: "",
                        capture: isInputInCaptureMode
                    };
                }

                const newValue = multiple ? [...(currentValue ?? []), newPhoto] : newPhoto;
                setValue(newValue);
            } finally {
                set("isPhotoLoading", false);
            }
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
                {/* Hidden inputs for form submission (base64 mode only) */}
                {outputFormat === "base64" && (
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
                    </>
                )}
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
                    {(photo?.previewUrl || photo?.src)
                        ? <img { ...mergeProps("img", props => ({
                            ...props,
                            src: photo?.previewUrl || photo?.src,
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
                    {(photo?.previewUrl || photo?.src)
                    ? <img { ...mergeProps("popupImg", props => ({
                        ...props,
                        src: photo?.previewUrl || photo?.src,
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