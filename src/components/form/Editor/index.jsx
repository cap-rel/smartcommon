import { useEffect, useState } from "react";
import { isEmpty } from "../../../../globals/functions";
import { Help, Icon, Label } from "../../../dol";
import MDEditor, { commands } from '@uiw/react-md-editor';
import { propTypes } from "./props";

// TODO Faire les pattern
// TODO Faire le required
// TODO Faire le disabled (géré par mdeditor directement => à regarder)

export const Editor = ({
  label = null,
  id = null,
  help = null,
  placeholder = null,
  min = 0,
  size = null,
  max = null,
  pattern = null,
  rows = 5,
  settings = null,
  readOnly = false,
  required = false,
  disabled = false,
  value,
  onChange = () => {},
  color = null,
  className = null
}) => {
  const labelProps = { id, label, required, help, className };
  const editorProps = { id, placeholder, required, disabled };

const [editorValue, setEditorValue] = useState(value);
     
useEffect(() => {
  onChange(editorValue);
}, [editorValue]);

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

return (
  <Label { ...labelProps}>
      <div className={`col w-full`}>
        <MDEditor
          className={`w-full`}
          value={value}
          onChange={setEditorValue}
          textareaProps={{
            placeholder: placeholder,
            maxLength: maxLength
          }}
          preview={`edit`}
          { ...editorProps}
          // commandsFilter={(cmd) => {
          //   if (/(live|preview|edit)/.test(cmd.name)) {
          //     return false;
          //   }
          //   return cmd;
          // }}

          // excludeCommands={[
          //   commands.codeLive,
          //   commands.codePreview,
          //   commands.image,
          // ]}

          // TODO Il faut probablement sécuriser l'éditeur un peu comme tous les autres champs
          // previewOptions={{
          //   rehypePlugins: [[rehypeSanitize]],
          // }}
        />
        {/* <MDEditor.Markdown 
          className="p-2 w-full text-xs"
          source={
            value 
            ? `**Rendu :**  
            ${value}` 
            : "**Aucun rendu ...**"} 
        /> */}
      </div>
    </Label>
  )
};

Editor.propTypes = propTypes;