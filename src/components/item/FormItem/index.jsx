import { Address, Audios, Boolean, Checkbox, Checkbox, Drawing, Duration, Editor, Files, GpsPoints, IconSelect, Input, MultiNumber, Photos, Radio, Range, Rating, Select, Signature, Stepper, Tags, Textarea, Videos } from "../../dol";
import { isFunction, isNumber, isString, isUndefined, setComponent } from "../../../globals/functions";
import { useMemo } from "react";

export const FormItem = (props) => {
  const Components = useMemo(() => ({ Address, Audios, Boolean, Checkbox, Checkbox, Drawing, Duration, Editor, Files, GpsPoints, IconSelect, Input, MultiNumber, Photos, Radio, Range, Rating, Select, Signature, Stepper, Tags, Textarea, Videos }), []);

  const { type } = props;

  const Component = Components[setComponent(type)];

  return <Component { ...props} />;
};