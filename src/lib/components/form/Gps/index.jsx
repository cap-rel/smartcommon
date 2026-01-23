import toast from "react-hot-toast";
import { FaLocationDot } from "react-icons/fa6";
import { useEffect, useRef } from "react";
import { isNil, isEmpty } from "lodash";

import { applyFunctionIfNotNil, locate } from "lib/utils";
import { Button, Label } from "lib/components";
import { useStates, useField, useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

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
  const { variantProps, mergeProps } = useVariantMerger("Gps", props);
  
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
  } = variantProps;

  const errors = (currentValue) => ({
    required: { 
      condition: required && isEmpty(currentValue),
      message: "Vous devez géolocaliser."
    },
  });

  const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors });

  const initialStates = {
    isLocating: false,
  };

  const { states, set } = useStates({ initialStates, debug: false });

  const { isLocating } = states;

  // Ref to track geolocation timeout for proper cleanup
  const geoLocateTimeoutRef = useRef(null);

  // Cleanup timeout on unmount to prevent memory leaks and setState on unmounted component
  useEffect(() => {
    return () => {
      if (geoLocateTimeoutRef.current) {
        clearTimeout(geoLocateTimeoutRef.current);
      }
    };
  }, []);

  // const isRealValueEmpty = multiple ? isEmpty(currentValue) : isEmpty(currentValue[0]);

  const geoLocate = () => {
    if (!disabled && !readOnly && !isFormSubmitting) {
      set("isLocating", true);
      // Clear any pending timeout to avoid race conditions on rapid clicks
      if (geoLocateTimeoutRef.current) {
        clearTimeout(geoLocateTimeoutRef.current);
      }
      geoLocateTimeoutRef.current = setTimeout(() => {
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
    const newValue = multiple ? [...(currentValue ?? []).slice(0, index), ...(currentValue ?? []).slice(index + 1)] : ["", ""];

    setValue(newValue);
  };

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
      showErrors={isFormSubmitted}
      errors={filteredErrors}
      mergeProps={mergeProps}
    >
      <div { ...mergeProps("buttonContainer", props => ({
        ...props,
        className: `rounded-md bg-soft-bg flex items-center gap-app-xs`
      }))}>
        <input
          name={name}
          onChange={() => {}}
          value={currentValue?.[0]}
          hidden
        />
        <input
          name={name}
          onChange={() => {}}
          value={currentValue?.[1]}
          hidden
        />
        <Button { ...mergeProps("LocateButton", props => ({
          icon: FaLocationDot,
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