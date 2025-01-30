import { AddressDol, AudiosDol, BooleanDol, CheckboxDol, ColorDol, DrawingDol, DurationDol, EditorDol, FileDol, GpsDol, IconSelectDol, InputDol, MultiNumberDol, PhotosDol, RadioDol, RangeDol, RatingDol, SelectDol, SignatureDol, StepperDol, TagsDol, TextareaDol, VideosDol } from "../../../dol";
import { isFunction, isNumber, isString, isUndefined, setComponent } from "../../../../globals/functions";
import { useMemo } from "react";

export const FormItemDol = (props) => {
  const Components = useMemo(() => ({ AddressDol, AudiosDol, BooleanDol, CheckboxDol, ColorDol, DrawingDol, DurationDol, EditorDol, FileDol, GpsDol, IconSelectDol, InputDol, MultiNumberDol, PhotosDol, RadioDol, RangeDol, RatingDol, SelectDol, SignatureDol, StepperDol, TagsDol, TextareaDol, VideosDol }), []);

  const { type } = props;

  const Component = Components[setComponent(type)];

  return <Component { ...props} />;
};