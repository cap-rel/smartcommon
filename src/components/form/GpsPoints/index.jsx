import toast from "react-hot-toast";
import { getUserLocation, isEmpty, isNil } from "../../../globals/functions";
import { Label } from "../Label";
import { Button, Icon, Spinner } from "../../others";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { useStates } from "../../../hooks";
import { useEffect } from "react";
import Geolocation from 'react-native-geolocation-service';
import { FaLocationDot, FaMapLocationDot } from "react-icons/fa6";
import { RiCloseLargeFill } from "react-icons/ri";

// IDEA Add location via map

// TODO Finish the location button
// TODO Find a solution for multiGpsPoints

export const GpsPoints = ({
  label,
  labelRow = false,
  help,
  multiple = false,
  onValueChange = () => {},

  containerProps,
  labelContainerProps,
  labelProps,
  requiredStarProps,
  helpProps,
  inputContainerProps,
  listProps,
  listItemProps,
  inputProps,
  locationTypeIconProps,
  latitudeProps,
  longitudeProps,
  deleteButtonProps,
  deleteButtonIconProps,
  buttonContainerProps,
  locationButtonProps,
  locationButtonIconProps,
  locationButtonSpinnerProps,
  locationButtonLabelProps,
  mapButtonProps,
  mapButtonIconProps,
  mapButtonSpinnerProps,
  mapButtonLabelProps,
  ...props
}) => {
  const gpsPointsPs = { ...props, inputProps };
  const { disabled, required, readOnly, id, value, defaultValue } = gpsPointsPs

  const gpsPointsPsForLabel = { disabled, required, readOnly, id };
  const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...gpsPointsPsForLabel };

  const { states, set } = useStates({
    isLocating: false,
    localValue: defaultValue ?? (multiple ? [] : ["", ""])
  });

  const { isLocating, localValue } = states;

  const realValue = value ?? localValue;

  const isRealValueEmpty = multiple ? isEmpty(realValue) : isEmpty(realValue[0]);

  const locate = (e) => {
    e.preventDefault();
    set("isLocating", true);
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const coords = [position.coords.latitude, position.coords.longitude];
          const newValue = multiple ? [...realValue, coords] : coords;
          if (isNil(value)) {
            set("localValue", newValue);
          } else {
            onValueChange(newValue);
          }
          console.log(`Geolocation success`, coords, position);
          set("isLocating", false);
          toast.success("Succès de la géolocalisation");
        },
        error => {
          console.error(`Geolocation error`, error);
          set("isLocating", false);
          toast.error("Erreur lors de la géolocalisation\n" + error.message);
        }
      );
      // const coords = [40.35536627, 56.66638387];
      // const newValue = multiple ? [...realValue, coords] : coords;
      // if (isNil(value)) {
      //   set("localValue", newValue);
      // } else {
      //   onValueChange(newValue);
      // }
      // toast.success("Succès de la géolocalisation");
    }, 1000);
  };

  const deleteGpsPoints = (e, index) => {
    e.preventDefault();
    const newValue = multiple ? [...realValue.slice(0, index), ...realValue.slice(index + 1)] : ["", ""];

    if (isNil(value)) {
      set("localValue", newValue);
    } else {
      onValueChange(newValue);
    }
  };

  const GpsPoints = (gpsPoints, index) => {
    return (
      <li 
        { ...listItemProps}
        className={twMerge(`first:rounded-t-md gap-4 p-2 text-soft-text row-v-center`, listItemProps?.className)}
      >
        <input
          { ...gpsPointsPs}
          onChange={() => {}}
          value={gpsPoints[0]}
          className={twMerge(`hidden`, gpsPointsPs?.className)}
        />
        <input
          { ...gpsPointsPs}
          onChange={() => {}}
          value={gpsPoints[1]}
          className={twMerge(`hidden`, gpsPointsPs?.className)}
        />
        <FaMapLocationDot
          { ...locationTypeIconProps}
          className={twMerge(`ml-2 text-xl text-primary`, locationTypeIconProps?.className)}
        />
        <div 
          { ...latitudeProps}
          className={twMerge(`truncate grow text-strong-text`, latitudeProps?.className)}
        >
          {gpsPoints[0]}
        </div>
        <div 
          { ...longitudeProps}
          className={twMerge(`truncate grow text-strong-text`, longitudeProps?.className)}
        >
          {gpsPoints[1]}
        </div>
        <Button
          left={<RiCloseLargeFill { ...deleteButtonIconProps} />}
          { ...deleteButtonProps}
          onClick={e => deleteGpsPoints(e, index)}
          className={twMerge(`rounded-full bg-strong text-soft-text`, deleteButtonProps?.className)}
        />
      </li>
    );
  }

  return (
    <Label { ...allLabelPs}>
      <div 
        { ...inputContainerProps}
        className={twMerge(`rounded-md bg-strong col`, inputContainerProps?.className)}
      >
        <ul 
          { ...listProps}
          className={twMerge(`divide-y col rounded-t-md divide-soft-border ${!isRealValueEmpty && "border border-b-0 border-soft-border"}`, listProps?.className)}
        >
          {
            multiple 
              ? !isEmpty(realValue) && realValue.map((gpsPoints, GPI) => GpsPoints(gpsPoints, GPI))
              : !isEmpty(realValue[0]) && GpsPoints(realValue)
              
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
        </div>
      </div>     
    </Label>
  );
};

GpsPoints.propTypes = propTypes;