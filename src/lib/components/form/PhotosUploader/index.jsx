import { FaCamera, FaFileImport, FaTrashCan, FaImage } from "react-icons/fa6";
import { useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { GiSaveArrow } from "react-icons/gi";
import { isNil, isEmpty } from "lodash";

import { useFile, useStates, useField, useVariantMerger, useUpload, useUploadQueue } from "lib/hooks";
import { Popup, Button, Label, Input, Textarea } from "lib/components";
import { applyFunctionIfNotNil, locate, splitFileExtension } from "lib/utils";

import { DEFAULT_LABELS, propTypes } from "./props";

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

        // For outputFormat="upload" only: route the upload through the
        // offline-first queue (useUploadQueue). When true, an upload
        // that fails offline or due to network/5xx is persisted in
        // IndexedDB and retried automatically; the photo is stored with
        // a pendingId (no uploadId yet) and a "Envoi..." badge is shown.
        // When the queue resolves it, pendingId is swapped for uploadId
        // and the badge disappears.
        queue: queueMode = false,

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
    const { uploadFile, cancelUpload } = useUpload({ endpoint: uploadEndpoint, queue: queueMode });
    // Subscribe to the queue's resolution stream so we can patch back the
    // uploadId once a previously-pending photo lands on the server. The
    // hook is only mounted when queueMode is on so legacy users keep paying
    // zero IDB cost.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const uploadQueue = queueMode ? useUploadQueue({ endpoint: uploadEndpoint }) : null;

    // currentValue is read inside the onResolved callback (which is a
    // long-lived subscription), so we keep a ref to avoid stale closure.
    const currentValueRef = useRef(currentValue);
    useEffect(() => { currentValueRef.current = currentValue; }, [currentValue]);

    useEffect(() => {
        if (!queueMode || !uploadQueue) return undefined;
        return uploadQueue.onResolved(({ pending_id, upload_id }) => {
            const value = currentValueRef.current;
            const patch = (photo) => (
                photo?.pendingId === pending_id
                    ? { ...photo, pendingId: null, uploadId: upload_id }
                    : photo
            );
            if (multiple) {
                if (!Array.isArray(value)) return;
                if (!value.some(p => p?.pendingId === pending_id)) return;
                setValue(value.map(patch));
            } else if (value?.pendingId === pending_id) {
                setValue(patch(value));
            }
        });
    }, [queueMode, uploadQueue, multiple, setValue]);

    const addPhoto = async file => {
        if (!disabled && !readOnly && !isFormSubmitting) {
            set("isPhotoLoading", true);

            let gpsPoints = [null, null];

            if (isInputInCaptureMode) {
                locate(
                    coords => { gpsPoints = coords },
                    error => toast.error(labels.geolocationError)
                );
            }

            const title = splitFileExtension(file.name)[0];
            let newPhoto;

            try {
                // Resize/compress the file before upload to avoid hitting
                // server upload limits. EXIF (orientation, GPS, etc.) is
                // preserved by browser-image-compression for JPEG output.
                // Pass compressOptions={ skip: true } to opt out.
                const shouldCompress = file?.type?.startsWith("image/")
                    && compressOptions?.skip !== true;

                if (outputFormat === "upload") {
                    // Upload mode: POST the binary to smartauth /upload,
                    // keep an upload_id for the form payload and a local
                    // previewUrl for rendering. The business module then
                    // references newPhoto.uploadId from its own JSON
                    // payload. Server-side, it consumes the staged file
                    // via SmartAuth\Api\UploadHelper::consumeUpload().
                    const fileToSend = shouldCompress
                        ? await resizeImage(file, { ...compressOptions, outputType: "file" })
                        : file;
                    const previewUrl = URL.createObjectURL(fileToSend);
                    let uploadResult;
                    try {
                        uploadResult = await uploadFile(fileToSend);
                    } catch (err) {
                        URL.revokeObjectURL(previewUrl);
                        // Always log: silent failures hide regressions.
                        console.error("PhotosUploader upload failed:", err);
                        if (onUploadError) {
                            onUploadError(err);
                        } else {
                            toast.error(labels.uploadError);
                        }
                        return;
                    }
                    newPhoto = {
                        uploadId: uploadResult?.upload_id ?? null,
                        // When queueMode is on and the POST was offline /
                        // network-failed / 5xx, the result carries a
                        // pendingId instead. The useUploadQueue.onResolved
                        // subscription above will swap it for the real
                        // uploadId once the server acknowledges.
                        pendingId: uploadResult?.pending_id ?? null,
                        previewUrl,
                        gpsPoints,
                        title,
                        description: "",
                        capture: isInputInCaptureMode,
                        mimeType: uploadResult?.mime ?? fileToSend.type,
                        filename: uploadResult?.filename ?? fileToSend.name,
                        size: uploadResult?.size,
                        sha256: uploadResult?.sha256,
                    };
                } else if (outputFormat === "blob") {
                    // Blob mode: store compressed file/blob with preview URL.
                    const fileToStore = shouldCompress
                        ? await resizeImage(file, { ...compressOptions, outputType: "file" })
                        : file;
                    const previewUrl = URL.createObjectURL(fileToStore);
                    newPhoto = {
                        blob: fileToStore,
                        previewUrl,
                        gpsPoints,
                        title,
                        description: "",
                        capture: isInputInCaptureMode,
                        mimeType: fileToStore.type,
                        filename: fileToStore.name
                    };
                } else {
                    // Base64 mode: legacy behavior
                    const base64 = shouldCompress
                        ? await resizeImage(file, compressOptions)
                        : await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = () => reject(reader.error);
                            reader.readAsDataURL(file);
                        });
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
                        : (
                            <div className="flex flex-col items-center gap-app-xxs">
                                <FaImage className="text-soft-text text-[80px]" />
                                <div className="text-app-xs italic text-center text-medium-text">
                                    {labels.clickToShow}
                                </div>
                            </div>
                        )
                    }
                    {/* "Envoi..." badge shown until the queue resolves the
                        pending upload into an uploadId. Only ever set when
                        outputFormat="upload" + queue=true. */}
                    {photo?.pendingId && (
                        <div { ...mergeProps("pendingBadge", props => ({
                            ...props,
                            className: "text-app-xs italic text-center text-medium-text"
                        }))}>
                            {labels.pendingBadge}
                        </div>
                    )}

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
                title: multiple ? labels.photoPopupTitle(index) : labels.photoPopupTitleSingle,
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
                    label: labels.titleField,
                    ...props,
                    name: name,
                    value: photo?.title,
                    onChange: value => {
                        updatePhotoInfo("title", value);
                        applyFunctionIfNotNil(props.onChange, value);
                    }
                }))} />
                <Textarea { ...mergeProps("DescriptionTextarea", props => ({
                    label: labels.descriptionField,
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
                        label: labels.saveButton,
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