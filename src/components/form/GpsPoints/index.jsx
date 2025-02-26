import toast from "react-hot-toast";
import { getUserLocation, isEmpty } from "../../../globals/functions";
import { Label } from "../Label";
import { Icon } from "../../others";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { useStates } from "../../../hooks";

export const GpsPoints = ({
  label,
  labelRow = false,
  help,
  multiple = false,
  onLocate,

  containerProps,
  labelContainerProps,
  labelProps,
  requiredStarProps,
  helpProps,
  inputProps,
  ...props
}) => {
  const GpsPointsPs = { ...props, inputProps };
  const { disabled, required, readOnly, id, value, defaultValue } = GpsPointsPs

  const { states, set } = useStates({
    points: value ?? defaultValue ?? [0, 0],
  });

  const { points } = states;

  const GspPointsPsForLabel = { disabled, required, readOnly, id };
  const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...GspPointsPsForLabel };  

  return (
    <Label { ...allLabelPs}>
      <input
        { ...GpsPointsPs}
        value={points[0]}
        className={twMerge(`hidden`, GpsPointsPs?.className)}
      />
      <input
        { ...GpsPointsPs}
        value={points[1]}
        className={twMerge(`hidden`, GpsPointsPs?.className)}
      />
      <button 
        onClick={e => 
          {
            e.preventDefault();
            set("points", [45, 46]);
            if (!isEmpty(onLocate)) {
              onLocate([45, 46]);
            }
            // getUserLocation()
            //   .then(location => {
            //     console.log(`Succés de la géolocalisation: ${location}`);
            //     onChange(location);
            //     toast.success("Succès de la géolocalisation");
            //   })
            //   .catch(error => {
            //     console.error(error);
            //     toast.error("Erreur lors de la géolocalisation\n" + error);
            //   })
          }
        }
        className={`p-4 text-2xl text-white rounded-full border border-primary bg-primary dark:bg-primary-20 dark:text-primary button-smt`}
      >
        <Icon library={`fa6`} name={`FaLocationDot`} />
      </button>
    </Label>
  );
};

GpsPoints.propTypes = propTypes;