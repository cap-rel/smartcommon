import toast from "react-hot-toast";
import SignaturePadLib from "signature_pad";
import { useEffect, useRef } from "react";
import { FaEraser, FaSignature } from "react-icons/fa6";
import { isEmpty } from "lodash";

import { Button, Label, Input } from "lib/components";
import { useStates, useField, useVariantMerger, useUpload, useUploadQueue } from "lib/hooks";
import { applyFunctionIfNotNil, locate } from "lib/utils/functions";

import { DEFAULT_LABELS, propTypes } from "./props";

export const SignaturePad = (props) => {
  const { variantProps, mergeProps } = useVariantMerger("SignaturePad", props);

  const {
    id,
    name,
    defaultValue,
    value,
    onChange,

    disabled,
    required,
    readOnly,

    // Output format. Two modes:
    //   - "dataURL" (default, legacy): value.src holds the canvas dataURL
    //     that the form serialises however it wants.
    //   - "upload": when the user validates, the canvas is converted to a
    //     PNG Blob and POSTed to smartauth /upload via useUpload. The form
    //     value carries uploadId (and pendingId, see queue below) instead
    //     of just the inline dataURL.
    outputFormat = "dataURL",

    // For outputFormat="upload" only: route uploads through the offline-first
    // useUploadQueue. Same semantics as PhotosUploader.queue (cf
    // ~/docs/upload-queue.md).
    queue: queueMode = false,

    // For outputFormat="upload" only: override the /upload endpoint path.
    uploadEndpoint,

    // For outputFormat="upload" only: callback when the underlying upload
    // throws (e.g. 4xx). Defaults to a toast.error notification.
    onUploadError,

    labels: userLabels = {},
  } = variantProps;

  const labels = { ...DEFAULT_LABELS, ...userLabels };

  const uploadMode = outputFormat === "upload";

  const errors = (currentValue) => ({
    required: {
      // In dataURL mode the form needs a dataURL. In upload mode it needs
      // an uploadId; a freshly drawn but not-yet-validated signature has
      // src set but no uploadId, which is rightly flagged as missing.
      condition: required && (
        uploadMode
          ? isEmpty(currentValue?.uploadId) && isEmpty(currentValue?.pendingId)
          : isEmpty(currentValue?.src)
      ),
      message: labels.requiredError,
    },
  });

  const defaultValueForMode = uploadMode
    ? { src: "", signer: "", uploadId: null, pendingId: null }
    : { src: "", signer: "" };

  const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({
    name,
    defaultValue: defaultValue ?? defaultValueForMode,
    value,
    onChange,
    errors
  });

  const initialStates = {
    isSignatureValidated: false
  };

  const { states, set } = useStates({ initialStates, debug: false });

  const { isSignatureValidated } = states;

  const canvasRef = useRef(null);
  const padRef = useRef(null);

  // Refs used to keep onEnd always reading the freshest value/setter,
  // since the SignaturePad instance is created once at mount.
  const currentValueRef = useRef(currentValue);
  currentValueRef.current = currentValue;
  const setValueRef = useRef(setValue);
  setValueRef.current = setValue;

  const blocked = disabled || readOnly || isFormSubmitting;

  // Upload pipeline (only mounted in upload mode). useUpload({queue:queueMode})
  // gives the unified { upload_id, pending_id } return when queueMode is on,
  // and the legacy raw response otherwise. useUploadQueue is needed only to
  // subscribe to the resolution stream (pendingId -> uploadId swap) and to
  // cancel pending rows on erase. outputFormat is a stable per-instance
  // option so the conditional hook call is safe at runtime.
  const { uploadFile, cancelUpload } = uploadMode
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ? useUpload({ endpoint: uploadEndpoint, queue: queueMode })
    : { uploadFile: null, cancelUpload: null };
  const uploadQueue = uploadMode && queueMode
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ? useUploadQueue({ endpoint: uploadEndpoint })
    : null;

  useEffect(() => {
    if (!uploadMode || !uploadQueue) return undefined;
    return uploadQueue.onResolved(({ pending_id, upload_id }) => {
      const v = currentValueRef.current;
      if (v?.pendingId === pending_id) {
        setValueRef.current({ ...v, pendingId: null, uploadId: upload_id });
      }
    });
  }, [uploadMode, uploadQueue]);

  // Mount: set up the underlying signature_pad instance on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);

    const pad = new SignaturePadLib(canvas, {
      backgroundColor: "transparent",
      penColor: "black",
      onEnd: () => {
        setValueRef.current({ ...currentValueRef.current, src: pad.toDataURL() });
      }
    });
    padRef.current = pad;

    return () => {
      pad.off();
      padRef.current = null;
    };
  }, []);

  // Enable/disable drawing based on readOnly/disabled/submitting state
  useEffect(() => {
    const pad = padRef.current;
    if (!pad) {
      return;
    }
    if (blocked) {
      pad.off();
    } else {
      pad.on();
    }
  }, [blocked]);

  // Keep the canvas internal buffer in sync with the visible size.
  //
  // Bug fixed here: when the SignaturePad is mounted while its parent
  // is display:none (or in a closed accordion, hidden tab, etc.),
  // canvas.offsetWidth/offsetHeight are 0 at mount time and the initial
  // sizing in the mount effect above ends up with a 0x0 internal
  // buffer. Once the parent becomes visible, the canvas displays at
  // its CSS size but signature_pad draws into the 0x0 buffer - the
  // strokes never appear. The ResizeObserver below re-sizes the buffer
  // every time the visible size changes (especially 0 -> real value)
  // and restores the in-progress drawing if any. Works for any
  // mount-while-hidden scenario (modal, accordion, tab, responsive
  // layout reflow, device rotation, ...).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const ro = new ResizeObserver(() => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      // Still hidden (parent display:none, accordion closed, ...).
      // Skip to avoid wiping a previously-correct buffer with zeros.
      if (w === 0 && h === 0) {
        return;
      }
      const pad = padRef.current;
      const data = pad?.toData?.() ?? [];
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
      if (pad && data.length > 0) {
        pad.fromData(data);
      }
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Convert the current canvas to a PNG Blob. Returns a Promise because
  // canvas.toBlob is callback-based; we adapt it once at the call site.
  const canvasToBlob = () => new Promise((resolve, reject) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      reject(new Error("canvas not mounted"));
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("canvas.toBlob returned null"));
      else resolve(blob);
    }, "image/png");
  });

  const validateCanvas = async () => {
    if (isSignatureValidated) {
      return toast(labels.alreadyValidated);
    }

    if (padRef.current.isEmpty()) {
      return toast(labels.emptySignature);
    }

    if (blocked) return;

    padRef.current.off();
    set("isSignatureValidated", true);

    const dataURL = padRef.current.toDataURL();

    if (uploadMode) {
      // Upload mode: convert to PNG Blob, POST via useUpload (queue-aware).
      // Keep the dataURL in src so the form can render the signature
      // preview without re-fetching it from the server.
      let blob;
      try {
        blob = await canvasToBlob();
      } catch (err) {
        console.error("SignaturePad: canvas.toBlob failed", err);
        toast.error(labels.conversionError);
        // Re-arm drawing so the user can retry.
        padRef.current.on();
        set("isSignatureValidated", false);
        return;
      }

      let uploadResult;
      try {
        uploadResult = await uploadFile(blob, { filename: "signature.png" });
      } catch (err) {
        console.error("SignaturePad: upload failed", err);
        if (onUploadError) {
          onUploadError(err);
        } else {
          toast.error(labels.uploadError);
        }
        padRef.current.on();
        set("isSignatureValidated", false);
        return;
      }

      setValue({
        ...currentValue,
        src: dataURL,
        uploadId: uploadResult?.upload_id ?? null,
        pendingId: uploadResult?.pending_id ?? null,
      });
      toast.success(labels.validatedSuccess);
    } else {
      // dataURL mode (legacy).
      setValue({ ...currentValue, src: dataURL });
      toast.success(labels.validatedSuccess);
    }

    locate(
      coords => setValueRef.current({ ...currentValueRef.current, gpsPoints: coords }),
      error => toast.error(labels.geolocationError)
    );
  };

  const eraseCanvas = () => {
    padRef.current?.clear();
    padRef.current?.on();
    set("isSignatureValidated", false);

    if (uploadMode) {
      // Best-effort cleanup: drop the pending row from the queue (it has
      // not been sent yet) or ask the server to discard the staged file
      // (it has been sent but the user changed their mind).
      const { pendingId, uploadId } = currentValue ?? {};
      if (pendingId && uploadQueue) {
        uploadQueue.cancel(pendingId).catch((err) => {
          console.warn("SignaturePad: queue cancel failed", err);
        });
      }
      if (uploadId && cancelUpload) {
        cancelUpload(uploadId).catch((err) => {
          console.warn("SignaturePad: server-side cancel failed", err);
        });
      }
      setValue({ ...currentValue, src: "", uploadId: null, pendingId: null });
    } else {
      setValue({ ...currentValue, src: "" });
    }
  };

  return (
    <Label
      { ...variantProps}
      showErrors={isFormSubmitted}
      errors={filteredErrors}
      mergeProps={mergeProps}
    >
      <input
        name={name}
        onChange={() => {}}
        value={currentValue?.src ?? ""}
        hidden
      />
      <input
        name={name}
        onChange={() => {}}
        value={currentValue?.signer ?? ""}
        hidden
      />
      {uploadMode && (
        <>
          <input
            name={name}
            onChange={() => {}}
            value={currentValue?.uploadId ?? ""}
            hidden
          />
          <input
            name={name}
            onChange={() => {}}
            value={currentValue?.pendingId ?? ""}
            hidden
          />
        </>
      )}

      <div { ...mergeProps("mainContainer", props => ({
        ...props,
        className: `rounded-md flex flex-col gap-app-base border border-border bg-soft-bg p-app-base`
      }))}>

        <div { ...mergeProps("header", props => ({
          ...props,
          className: `flex justify-between items-center -m-app-xs`
        }))}>

          <Button { ...mergeProps("EraseButton", props => ({
            icon: FaEraser,
            ...props,
            disabled: blocked,
            buttonProps: {
              ...props.buttonProps,
              className: `bg-soft-bg text-error text-app-lg rounded-app-xl p-app-xs`
            },
            onClick: e => {
              e.preventDefault();
              eraseCanvas();
              applyFunctionIfNotNil(props.onClick, e);
            }
          }))} />

          <div { ...mergeProps("title", props => ({
            ...props,
            className: `font-app-semibold text-strong-text`
          }))}>
            {labels.title}
          </div>

          <Button { ...mergeProps("ValidateButton", props => ({
            icon: FaSignature,
            ...props,
            disabled: blocked || isSignatureValidated,
            buttonProps: {
              ...props.buttonProps,
              // Visible only in upload mode: this is where the canvas is
              // converted to a PNG Blob and POSTed. In legacy dataURL mode
              // the button stays invisible to preserve historical UX.
              className: uploadMode
                ? "bg-soft-bg text-success text-app-lg p-app-xs rounded-app-xl"
                : "opacity-0 text-app-lg p-app-xs"
            },
            onClick: e => {
              e.preventDefault();
              if (uploadMode) {
                validateCanvas();
                applyFunctionIfNotNil(props.onClick, e);
              }
            },
          }))} />

        </div>

        <div { ...mergeProps("signatureContainer", props => ({
          ...props,
          className: `bg-strong-bg h-60 inset-shadow-sm`
        }))}>
          <canvas { ...mergeProps("Pad", props => ({
            ...props,
            ref: canvasRef,
            className: `size-full touch-none`
          }))} />
        </div>

        {uploadMode && currentValue?.pendingId && (
          <div { ...mergeProps("pendingBadge", props => ({
            ...props,
            className: "text-app-xs italic text-center text-medium-text"
          }))}>
            {labels.pendingBadge}
          </div>
        )}

        <Input { ...mergeProps("SignerInput", props => ({
          // inputIcon: <FaUser />,
          placeholder: labels.signerPlaceholder,
          ...props,
          required: props.required ?? required,
          disabled: props.disabled ?? disabled,
          readOnly: isFormSubmitting || (props.readOnly ?? readOnly),
          value: currentValue?.signer ?? "",
          onChange: value => setValue({ ...currentValue, signer: value }),
          inputContainerProps: {
            ...props.inputContainerProps,
            className: `rounded-none border-0 border-b-2 has-[input:focus]:ring-0 pt-0`
          },
          inputProps: {
            ...props.inputProps,
            className: `text-center`
          }
        }))} />

      </div>
    </Label>
  )
};

SignaturePad.propTypes = propTypes
