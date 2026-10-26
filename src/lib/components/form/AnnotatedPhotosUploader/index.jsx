import { useState } from "react";
import { FaCommentDots } from "react-icons/fa6";
import { isNil } from "lodash";

import { useField, useVariantMerger } from "lib/hooks";
import { Modal, PhotoAnnotator, PhotosUploader } from "lib/components";
import { applyFunctionIfNotNil, isEmptyValue } from "lib/utils";

import { DEFAULT_LABELS as UPLOADER_LABELS } from "lib/components/form/PhotosUploader/props";

import { DEFAULT_LABELS, propTypes } from "./props";

// Identity of a photo inside the field. Positions shift when a photo is
// deleted, so neither the index nor the uploadId (null while the upload is
// queued offline) can key the annotations: a uid is minted at capture time.
// Alphanumeric only, so that a server can put it in a file name and split it
// from the field name on a separator ('-' or '_').
const newPhotoUid = () => (
    typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, "")
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
);

/**
 * Multi-photo field where each photo carries its own PhotoAnnotator
 * markers. Built on PhotosUploader (multiple mode): capture, compression,
 * upload, offline queue and the photo popup are its own; this component adds
 * the photo uid, the annotations, and an annotate button under each
 * thumbnail that opens the annotator in a Modal.
 *
 * Works like any form field: inside a <Form> by `name`, controlled with
 * `value` + `onChange`, or uncontrolled from `defaultValue`.
 */
export const AnnotatedPhotosUploader = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("AnnotatedPhotosUploader", props);

    const {
        name,
        value,
        defaultValue,
        onChange,

        required,
        disabled,
        readOnly,
        min,
        exact,
        max,

        annotationTypes = {},

        formSubmitted,
        onError,

        labels: userLabels = {},

        // Own element props and sub-components: never forwarded as-is.
        variant: _variant,
        annotateButtonProps: _annotateButtonProps,
        annotateCountProps: _annotateCountProps,
        PhotosUploader: _photosUploader,
        PhotoAnnotator: _photoAnnotator,
        Modal: _modal,

        // Everything else (label, help, outputFormat, queue, compressOptions,
        // Label/PhotosUploader element props...) belongs to PhotosUploader.
        ...uploaderProps
    } = variantProps;

    const labels = { ...DEFAULT_LABELS, ...userLabels };

    // Same rules as PhotosUploader (which displays them): registered here so
    // that a <Form> gates its submit on this field's own value.
    const errors = (currentValue) => ({
        required: {
            condition: required && isEmptyValue(currentValue),
            message: UPLOADER_LABELS.requiredError,
        },
        min: {
            condition: !isNil(min) && (currentValue?.length ?? 0) < min,
            message: UPLOADER_LABELS.minError(min),
        },
        max: {
            condition: !isNil(max) && (currentValue?.length ?? 0) > max,
            message: UPLOADER_LABELS.maxError(max),
        },
        exact: {
            condition: !isNil(exact) && (currentValue?.length ?? 0) !== exact,
            message: UPLOADER_LABELS.exactError(exact),
        },
    });

    const { currentValue, setValue } = useField({ name, defaultValue, value, onChange, errors, formSubmitted, onError });

    const photos = Array.isArray(currentValue) ? currentValue : [];
    const isLocked = !!readOnly || !!disabled;

    // Index of the photo whose annotator is open. The Modal covers the grid,
    // so the list cannot be reordered or shortened while it is open.
    const [openIndex, setOpenIndex] = useState(null);
    const openPhoto = isNil(openIndex) ? null : (photos[openIndex] ?? null);

    // Every value this field writes goes through here: a photo without uid
    // (new capture, or loaded from a server without one) gets one, with an
    // empty annotation list; existing uids and annotations are kept.
    const normalizePhotos = (nextPhotos) => (Array.isArray(nextPhotos) ? nextPhotos : []).map((photo) => ({
        ...photo,
        uid: photo?.uid ?? newPhotoUid(),
        annotations: Array.isArray(photo?.annotations) ? photo.annotations : [],
    }));

    // Every change of the uploader (capture, delete, title edit, queue
    // resolution) goes through here.
    const onPhotosChange = (nextPhotos) => {
        setValue(normalizePhotos(nextPhotos));
    };

    const setAnnotations = (index, nextAnnotations) => {
        setValue(normalizePhotos(photos.map((photo, i) => (
            i === index ? { ...photo, annotations: Array.isArray(nextAnnotations) ? nextAnnotations : [] } : photo
        ))));
    };

    const renderAnnotateButton = (photo, index) => {
        const count = Array.isArray(photo?.annotations) ? photo.annotations.length : 0;

        // Read-only with nothing to show: no button at all.
        if (isLocked && count === 0) {
            return null;
        }

        const label = isLocked ? labels.viewAnnotations : labels.annotate;

        return (
            <button
                type="button"
                { ...mergeProps("annotateButton", props => ({
                    "aria-label": label,
                    title: label,
                    "data-testid": `annotated-photos-annotate-${index}`,
                    "data-annotation-count": count,
                    ...props,
                    onClick: e => {
                        e.preventDefault();
                        setOpenIndex(index);
                        applyFunctionIfNotNil(props.onClick, e);
                    },
                    className: "flex items-center gap-app-xxs px-app-xs py-app-xxs rounded-app-md bg-soft-bg text-app-sm text-medium-text active:brightness-soft"
                }))}
            >
                <FaCommentDots />
                {count > 0 && (
                    <span { ...mergeProps("annotateCount", props => ({
                        ...props,
                        className: "text-app-xs font-semibold"
                    }))}>
                        {count}
                    </span>
                )}
            </button>
        );
    };

    return (
        <>
            <PhotosUploader { ...mergeProps("PhotosUploader", props => ({
                ...uploaderProps,
                ...props,
                name,
                multiple: true,
                required,
                disabled,
                readOnly,
                min,
                exact,
                max,
                formSubmitted,
                value: photos,
                onChange: onPhotosChange,
                renderPhotoExtra: renderAnnotateButton,
            }))} />

            <Modal { ...mergeProps("Modal", props => ({
                size: "full",
                title: isNil(openIndex) ? "" : labels.annotationsTitle(openIndex),
                ...props,
                isOpen: !isNil(openPhoto),
                onClose: () => {
                    setOpenIndex(null);
                    applyFunctionIfNotNil(props.onClose);
                },
            }))}>
                {openPhoto && (
                    <PhotoAnnotator { ...mergeProps("PhotoAnnotator", props => ({
                        ...props,
                        src: openPhoto.previewUrl || openPhoto.src || null,
                        annotations: Array.isArray(openPhoto.annotations) ? openPhoto.annotations : [],
                        onChange: nextAnnotations => setAnnotations(openIndex, nextAnnotations),
                        annotationTypes,
                        readOnly: isLocked,
                    }))} />
                )}
            </Modal>
        </>
    );
};

AnnotatedPhotosUploader.propTypes = propTypes;
