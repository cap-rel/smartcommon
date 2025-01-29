import toast from "react-hot-toast";
import { getUserLocation } from "../../../../globals/functions";
import IconDol from "../../others/IconDol";
import LabelDol from "../LabelDol";
import { propTypes } from "./props";

const GpsDol = ({
  label = null,
  id = null,
  help = null,
  readOnly = false,
  required = false,
  disabled = false,
  value,
  onChange = () => {},
  color = null,
  className = null
}) => {
  const labelProps = { id, label, required, help, className };
  const textareaProps = { id, required, disabled };

  return (
    <LabelDol { ...labelProps}>
      <button 
        onClick={e => 
          getUserLocation()
            .then(location => {
              console.log(`Succés de la géolocalisation: ${location}`);
              onChange(location);
              toast.success("Succès de la géolocalisation");
            })
            .catch(error => {
              console.error(error);
              toast.error("Erreur lors de la géolocalisation\n" + error);
            })
        }
        className={`p-4 border border-primary rounded-full bg-primary dark:bg-primary-20 text-white dark:text-primary text-2xl button-dol`}
      >
        <IconDol library={`fa6`} icon={`FaLocationDot`} />
      </button>
    </LabelDol>
  );
};

GpsDol.propTypes = propTypes;

export default GpsDol;
