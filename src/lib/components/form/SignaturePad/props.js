import PropTypes from "prop-types";

export const propTypes = {
  id: PropTypes.string,

  label: PropTypes.string,
  help: PropTypes.string,
  icon: PropTypes.node,
  prefix: PropTypes.node,
  suffix: PropTypes.node,

  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,

  // Output format. Two modes:
  //   - "dataURL" (default, legacy): value = { src: dataURL, signer, gpsPoints? }
  //   - "upload": canvas is converted to a PNG Blob on validate and POSTed
  //     to smartauth /upload. value = { src: dataURL_preview, signer,
  //     gpsPoints?, uploadId, pendingId }.
  outputFormat: PropTypes.oneOf(["dataURL", "upload"]),

  // outputFormat="upload" only: route uploads through useUploadQueue
  // (offline-first). See ~/docs/upload-queue.md.
  queue: PropTypes.bool,

  // outputFormat="upload" only: override the /upload endpoint path.
  uploadEndpoint: PropTypes.string,

  // outputFormat="upload" only: callback when the underlying upload throws.
  onUploadError: PropTypes.func,

  name: PropTypes.string,
  value: PropTypes.object,
  onChange: PropTypes.func,
  defaultValue: PropTypes.object,

  formSubmitted: PropTypes.bool,
  onError: PropTypes.func,

  containerProps: PropTypes.object,
  labelContainerProps: PropTypes.object,
  iconProps: PropTypes.object,
  labelProps: PropTypes.object,
  starProps: PropTypes.object,
  childrenContainerProps: PropTypes.object,
  prefixProps: PropTypes.object,
  suffixProps: PropTypes.object,
  footerProps: PropTypes.object,
  helpIconProps: PropTypes.object,
  helpAndErrorsContainerProps: PropTypes.object,
  helpProps: PropTypes.object,
  errorProps: PropTypes.object,
  
  mainContainerProps: PropTypes.object,
  headerProps: PropTypes.object,
  EraseButton: PropTypes.object,
  titleProps: PropTypes.object,
  ValidateButton: PropTypes.object,
  signatureContainerProps: PropTypes.object,
  Pad: PropTypes.object,
  pendingBadgeProps: PropTypes.object,
  SignerInput: PropTypes.object,

  // i18n: merged shallowly over DEFAULT_LABELS.
  labels: PropTypes.object,
};

export const DEFAULT_LABELS = {
  requiredError: "This field is required.",
  alreadyValidated: "The signature is already validated... To redo the signature, click on the eraser",
  emptySignature: "The signature is empty...",
  conversionError: "Signature conversion failed.",
  uploadError: "Signature upload failed.",
  validatedSuccess: "Signature validated...",
  geolocationError: "Failed to get capture location.",
  title: "Signature",
  pendingBadge: "Sending...",
  signerPlaceholder: "Signer name",
};