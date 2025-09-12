import toast from "react-hot-toast";
import { applyFunctionIfNotNil, isEmpty, isNil, locate } from "../../../globals/functions";
import { Label } from "../tools/Label";
import { Button, Spinner } from "../../others";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { FaLocationDot, FaMapLocationDot } from "react-icons/fa6";
import { RiCloseLargeFill } from "react-icons/ri";
import { useEffect } from "react";

// IDEA Add location via map

// TODO Finish the location button
// TODO Find a solution for multigps

// label,
// labelRow = false,
// help,
// multiple = false,
// onValueChange = () => {},

// containerProps,
// labelContainerProps,
// labelProps,
// requiredStarProps,
// helpProps,
// inputContainerProps,
// listProps,
// listItemProps,
// inputProps,
// locationTypeIconProps,
// latitudeProps,
// longitudeProps,
// deleteButtonProps,
// deleteButtonIconProps,
// buttonContainerProps,
// locationButtonProps,
// locationButtonIconProps,
// locationButtonSpinnerProps,
// locationButtonLabelProps,
// mapButtonProps,
// mapButtonIconProps,
// mapButtonSpinnerProps,
// mapButtonLabelProps,
// ...props

// TODO multiple

export const Gps = props => {
  const { variantProps, mergeProps } = useVariantToProps("Gps", props);
  
  const { 
    id,
    name,
    value,
    defaultValue,
    onChange = () => {},

    required,
    disabled,
    readOnly,

    multiple,

    onError = () => {},
  } = variantProps;

  const { currentValue, setValue } = useValue(defaultValue ?? null, value, onChange);

  const { states, set } = useStates({
    isLocating: false,
  });

  const { isLocating } = states;

  // const isRealValueEmpty = multiple ? isEmpty(currentValue) : isEmpty(currentValue[0]);

  const geoLocate = () => {
    if (!disabled && !readOnly) {
      set("isLocating", true);
      setTimeout(() => {
        locate(
          coords => {
            setValue(coords);
            toast.success("Succès de la géolocalisation");
            set("isLocating", false);
          },
          err => {
            toast.error("Erreur de la géolocalisation");
            set("isLocating", false);
          }
        )
        // const coords = [40.35536627, 56.66638387];
        // const newValue = multiple ? [...currentValue, coords] : coords;
        // if (isNil(value)) {
        //   set("localValue", newValue);
        // } else {
        //   onValueChange(newValue);
        // }
        // toast.success("Succès de la géolocalisation");
      }, 1000);
    }
  };

  const deleteGpsPoints = (e, index) => {
    e.preventDefault();
    const newValue = multiple ? [...currentValue.slice(0, index), ...currentValue.slice(index + 1)] : ["", ""];

    setValue(newValue);
  };

  const errors = {
    required: { 
      condition: required && isEmpty(currentValue),
      message: "Vous devez géolocaliser."
    },
  };

  useEffect(() => {
    Object.entries(errors).forEach(([errorKey, error]) => onError(`${id}-${errorKey}`, error.condition))
  }, [currentValue]);

  // const gps = (gpsPoints, index) => {
  //   return (
  //     <li 
  //       { ...listItemProps}
  //       className={twMerge(`first:rounded-t-md gap-4 p-2 text-soft-text row-v-center`, listItemProps?.className)}
  //     >
  //       <input
  //         { ...gpsPointsPs}
  //         onChange={() => {}}
  //         value={gpsPoints[0]}
  //         className={twMerge(`hidden`, gpsPointsPs?.className)}
  //       />
  //       <input
  //         { ...gpsPointsPs}
  //         onChange={() => {}}
  //         value={gpsPoints[1]}
  //         className={twMerge(`hidden`, gpsPointsPs?.className)}
  //       />
  //       <FaMapLocationDot
  //         { ...locationTypeIconProps}
  //         className={twMerge(`ml-2 text-xl text-primary`, locationTypeIconProps?.className)}
  //       />
  //       <div 
  //         { ...latitudeProps}
  //         className={twMerge(`truncate grow text-strong-text`, latitudeProps?.className)}
  //       >
  //         {gpsPoints[0]}
  //       </div>
  //       <div 
  //         { ...longitudeProps}
  //         className={twMerge(`truncate grow text-strong-text`, longitudeProps?.className)}
  //       >
  //         {gpsPoints[1]}
  //       </div>
  //       <Button
  //         left={<RiCloseLargeFill { ...deleteButtonIconProps} />}
  //         { ...deleteButtonProps}
  //         onClick={e => deleteGpsPoints(e, index)}
  //         className={twMerge(`rounded-full bg-strong text-soft-text`, deleteButtonProps?.className)}
  //       />
  //     </li>
  //   );
  // }

  return (
    <Label 
      { ...variantProps}
      errors={errors}
      mergeProps={mergeProps}
    >
      <div { ...mergeProps("buttonContainer", props => ({
        ...props,
        className: `rounded-md bg-soft-bg flex items-center gap-app-xs`
      }))}>
        <input
          name={name}
          onChange={() => {}}
          value={currentValue[0]}
          hidden
        />
        <input
          name={name}
          onChange={() => {}}
          value={currentValue[1]}
          hidden
        />
        <Button { ...mergeProps("LocateButton", props => ({
          icon: <FaLocationDot />,
          ...props,
          loading: isLocating,
          disabled: disabled,
          onClick: e => {
            e.preventDefault();
            geoLocate();
            applyFunctionIfNotNil(props.onClick, e);
          }
        }))}>
          Géolocaliser
        </Button>
        <div { ...mergeProps("location", props => props)}>
          {!isNil(currentValue) ? "Enregistrée" : "Aucune Localisation enregistrée"}
        </div>
        {/* <ul 
          { ...listProps}
          className={twMerge(`divide-y col rounded-t-md divide-soft-border ${!isRealValueEmpty && "border border-b-0 border-soft-border"}`, listProps?.className)}
        >
          {
            multiple 
              ? !isEmpty(currentValue) && currentValue.map((gpsPoints, GPI) => gps(gpsPoints, GPI))
              : !isEmpty(currentValue[0]) && gps(currentValue)
              
          }
        </ul>
        <div
          { ...buttonContainerProps}
          className={twMerge(`row-v-center rounded-b-md ${isRealValueEmpty ? "rounded-t-md" :  "rounded-t-none"}`, buttonContainerProps?.className)}
        >
          <Button
            { ...locationButtonProps}
            onClick={locate}
            disabled={isLocating}
            className={twMerge(`flex-1 p-2 gap-1 rounded-none rounded-bl-md col-h-center ${isRealValueEmpty ? "rounded-tl-md" :  "rounded-tl-none"}`, locationButtonProps?.className)}
          >
            {isLocating 
              ? <Spinner 
                  { ...locationButtonSpinnerProps}
                  className={twMerge(`border-white/50 border-l-white`, locationButtonSpinnerProps?.className)}
                />
              : <FaLocationDot 
                  { ...locationButtonIconProps}
                  className={twMerge(`text-3xl`, locationButtonIconProps?.className)}
                />
            }
            <div
              { ...locationButtonLabelProps}
              className={twMerge(`italic font-semibold`, locationButtonLabelProps?.className)}
            >
              Géolocaliser
            </div>
          </Button>
          <Button 
            { ...mapButtonProps}
            onClick={locate}
            disabled={isLocating}
            className={twMerge(`flex-1 p-2 gap-1 rounded-none rounded-br-md bg-secondary col-h-center ${isRealValueEmpty ? "rounded-tr-md" :  "rounded-tr-none"}`, mapButtonProps?.className)}
          >
            {isLocating 
              ? <Spinner 
                  { ...mapButtonSpinnerProps}
                  className={twMerge(`border-white/50 border-l-white`, mapButtonSpinnerProps?.className)}
                />
              : <FaMapLocationDot 
                  { ...mapButtonIconProps}
                  className={twMerge(`text-3xl`, mapButtonIconProps?.className)}
                />
            }
            <div
              { ...mapButtonLabelProps}
              className={twMerge(`italic font-semibold`, mapButtonLabelProps?.className)}
            >
              Carte
            </div>
          </Button>
        </div> */}
      </div>     
    </Label>
  );
};

Gps.propTypes = propTypes;