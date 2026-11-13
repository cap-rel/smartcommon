import { useRef } from "react";
import { FaEye, FaMarkdown } from "react-icons/fa6";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { twMerge } from "tailwind-merge";
import { isNil } from "lodash";

// import MDEditor, { commands } from '@uiw/react-md-editor';
import { Label, Textarea, Button } from "lib/components";
import { useStates, useVariantMerger } from "lib/hooks";

import { propTypes, DEFAULT_LABELS } from "./props";

// Label renders the required star through the `starProps` slot.
// `requiredStarProps` is the former name of that slot: it still applies when
// `starProps` is not given.
const withStarProps = (props) => (
  isNil(props.starProps) && !isNil(props.requiredStarProps)
    ? { ...props, starProps: props.requiredStarProps }
    : props
);

// TODO Style view (h1, h2, ...)
// TODO Create a random id for textarea

export const Editor = ({
  label,
  labelRow = false,
  help,
  onValueChange = () => {},

  containerProps,
  labelContainerProps,
  labelProps,
  requiredStarProps,
  starProps,
  helpProps,
  textareaContainerProps,
  textareaProps,
  htmlProps,
  buttonContainerProps,
  mdButtonProps,
  mdButtonIconProps,
  mdButtonLabelProps,
  htmlButtonProps,
  htmlButtonIconProps,
  htmlButtonLabelProps,
  labels: userLabels,
  ...props
}) => {

  // Label reads its slots through mergeProps, that is from what
  // useVariantMerger receives: the Label slots pulled out above go back in.
  const { variantProps, mergeProps, mergeQuickProps, setParams } = useVariantMerger("Editor", withStarProps({
    ...props,
    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    starProps,
    helpProps,
    labels: userLabels,
  }));

  // Theme labels (through useVariantMerger) overridden by the `labels` prop.
  const labels = { ...DEFAULT_LABELS, ...variantProps.labels };

  const textareaPs = { ...props, ...textareaProps };
  const { required, readOnly, disabled, id, value, defaultValue } = textareaPs;

  const textareaPsForLabel = { disabled, required, readOnly, id };

  // Label slots (container, label, star, help...) are read through mergeProps.
  const allLabelPs = { label, labelRow, help, ...textareaPsForLabel };

  // Ref to access textarea element for height measurement
  const textareaContainerRef = useRef(null);

  const initialStates = {
    localValue: defaultValue ?? "",
    isViewMode: false,
    textareaHeight: 200 // Default fallback height
  };

  const { states, set } = useStates({ initialStates, debug: false });

  const { localValue, isViewMode, textareaHeight } = states;

  const realValue = value ?? localValue;

  const handleTextareaOnChange = (newValue) => {
    if (isNil(value)) {
      set("localValue", newValue);
    } else {
      onValueChange(newValue);
    }
  };

  const switchToMarkDown = (e) => {
    e.preventDefault();
    set("isViewMode", false);
  };

  const switchToView = (e) => {
    e.preventDefault();
    // Capture textarea height before switching to view mode
    const textarea = textareaContainerRef.current?.querySelector("textarea");
    if (textarea) {
      set("textareaHeight", textarea.getBoundingClientRect().height);
    }
    set("isViewMode", true);
  };

  return (
    <Label { ...allLabelPs} mergeProps={mergeProps}>
      <div
        ref={textareaContainerRef}
        { ...textareaContainerProps}
        className={twMerge(`rounded-md col`, textareaContainerProps?.className)}
      >
        <Textarea
          placeholder={label ? `${label}...` : ""}
          { ...textareaPs}
          id={`textarea`}
          onChange={handleTextareaOnChange}
          value={realValue}
          className={twMerge(`rounded-b-none border-b-0 focus:ring-0 ${isViewMode ? "hidden" : ""}`, textareaPs?.className)}
        />
        <div
          { ...htmlProps}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(realValue)) }}
          style={{ "--height": `${textareaHeight}px`, ...htmlProps?.style }}
          className={twMerge(`p-2 rounded-t-md border border-b-0 bg-strong border-soft-border overflow-y-auto h-(--height) ${!isViewMode ? "hidden" : ""}`, htmlProps?.className)}
        />
        <div
          { ...buttonContainerProps}
          className={twMerge(`row-v-center rounded-b-md rounded-t-none`, buttonContainerProps?.className)}
        >
          <Button
            { ...mdButtonProps}
            disabled={!isViewMode}
            onClick={switchToMarkDown}
            className={twMerge(`flex-1 p-2 rounded-none rounded-bl-md col-h-center gap-1 rounded-tl-none`, mdButtonProps?.className)}
          >
            <FaMarkdown
              { ...mdButtonIconProps}
              className={twMerge(`text-3xl`, mdButtonIconProps?.className)}
            />
            <div
              { ...mdButtonLabelProps}
              className={twMerge(`italic font-semibold`, mdButtonLabelProps?.className)}
            >
              {labels.markdownButton}
            </div>
          </Button>
          <Button
            { ...htmlButtonProps}
            disabled={isViewMode}
            onClick={switchToView}
            className={twMerge(`flex-1 p-2 rounded-none rounded-br-md bg-secondary col-full-center gap-1 rounded-tr-none`, htmlButtonProps?.className)}
          >
            <FaEye
              { ...htmlButtonIconProps}
              className={twMerge(`text-3xl`, htmlButtonIconProps?.className)}
            />
            <div
              { ...htmlButtonLabelProps}
              className={twMerge(`italic font-semibold`, htmlButtonLabelProps?.className)}
            >
              {labels.previewButton}
            </div>
          </Button>
        </div>
      </div>
    </Label>
  );




// REACT MD EDITOR FOR DESKTOP

// const toolbarCommands = [
//   commands.bold,
//   commands.italic,
//   commands.strikethrough,
//   commands.code,
//   commands.hr,
//   commands.link,
//   commands.quote,
//   commands.unorderedListCommand,
//   commands.orderedListCommand,
// ];

// return (
//   <Label { ...labelProps}>
//       <div className={`w-full col`}>
//         <MDEditor
//           className={`w-full`}
//           value={value}
//           onChange={setEditorValue}
//           textareaProps={{
//             placeholder: placeholder,
//             // maxLength: maxLength
//           }}
//           preview={`edit`}
//           { ...editorProps}
//           // commandsFilter={(cmd) => {
//           //   if (/(live|preview|edit)/.test(cmd.name)) {
//           //     return false;
//           //   }
//           //   return cmd;
//           // }}

//           // excludeCommands={[
//           //   commands.codeLive,
//           //   commands.codePreview,
//           //   commands.image,
//           // ]}

//           // TODO Il faut probablement sécuriser l'éditeur un peu comme tous les autres champs
//           // previewOptions={{
//           //   rehypePlugins: [[rehypeSanitize]],
//           // }}
//         />
//         {/* <MDEditor.Markdown 
//           className="p-2 w-full text-xs"
//           source={
//             value 
//             ? `**Rendu :**  
//             ${value}` 
//             : "**Aucun rendu ...**"} 
//         /> */}
//       </div>
//     </Label>
//   )
};

Editor.propTypes = propTypes;