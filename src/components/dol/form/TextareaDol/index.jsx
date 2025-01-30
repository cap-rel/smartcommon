import { useRef } from "react";
import { isEmpty } from "../../../../globals/functions";
import { LabelDol } from "../../../dol";
import { propTypes } from "./props";

export const TextareaDol = ({
  label = null,
  id = null,
  help = null,
  placeholder = null,
  min = 0,
  size = null,
  max = null,
  pattern = null,
  rows = 5,
  readOnly = false,
  required = false,
  disabled = false,
  value,
  onChange = () => {},
  color = null,
  className = null,
  note = false
}) => {
  const labelProps = { id, label, required, help, className, note };
  const textareaProps = { id, placeholder, required, disabled };

  const textareaRef = useRef(null);

  const handleInput = () => {
    // Réinitialise la hauteur pour recalculer
    textareaRef.current.style.height = "auto";
    // Ajuste la hauteur au contenu
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  return (
    <LabelDol { ...labelProps}>
      <textarea 
        ref={textareaRef}
        onInput={note && handleInput}
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)} 
        className={`
          p-2 text-dol bg-light dark:bg-dark-soft outline-none bg-dol
          ${note ? "overflow-hidden resize-none pl-4" : "focus:ring-1 ring-primary focus:border-primary border-dol border rounded-md"}
        `}

        { ...textareaProps}
      >
      </textarea>
    </LabelDol>
  );
};

TextareaDol.propTypes = propTypes;
