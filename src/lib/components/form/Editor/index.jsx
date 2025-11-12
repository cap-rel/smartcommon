import { isNil } from "../../../utils/functions";
import { Label, Textarea } from "../../form";
// import MDEditor, { commands } from '@uiw/react-md-editor';
import { propTypes } from "./props";
import { useStates, useVariantMerger } from "../../../hooks";
import { twMerge } from "tailwind-merge";
import { FaEye, FaMarkdown } from "react-icons/fa6";
import { Button } from "../../little";
import { marked } from "marked";

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
  ...props
}) => {

  const { variantProps, mergeProps, mergeQuickProps, setParams } = useVariantMerger("Editor", props);

  const textareaPs = { ...props, ...textareaProps };
  const { required, readOnly, disabled, id, value, defaultValue } = textareaPs;

  const textareaPsForLabel = { disabled, required, readOnly, id };

  const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...textareaPsForLabel };

  const { states, set } = useStates({
    localValue: defaultValue ?? "",
    isViewMode: false
  });

  const { localValue, isViewMode } = states;

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
    set("isViewMode", true);
  };

  return (
    <Label { ...allLabelPs} mergeProps={mergeProps}>
      <div
        { ...textareaContainerProps} 
        className={twMerge(`rounded-md col`, textareaContainerProps?.className)}
      >
        <Textarea
          placeholder={label ? `${label}...` : ""}
          { ...textareaPs}
          id={`textarea`}
          onValueChange={handleTextareaOnChange}
          value={realValue}
          className={twMerge(`rounded-b-none border-b-0 focus:ring-0 ${isViewMode && "hidden"}`, textareaPs?.className)}
        />
        <div
          { ...htmlProps}
          dangerouslySetInnerHTML={{ __html: marked(realValue) }}
          style={{ "--height": `${document.querySelector("textarea")?.getBoundingClientRect().height}px`, ...htmlProps?.style }}
          className={twMerge(`p-2 rounded-t-md border border-b-0 bg-strong border-soft-border overflow-y-auto h-(--height) ${!isViewMode && "hidden"}`, htmlProps?.className)}
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
              Markdown
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
              Rendu
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