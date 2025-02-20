import { Address, Audios, Boolean, Checkbox, Drawing, Duration, Editor, Files, GpsPoints, IconSelect, Input, MultiNumber, Photos, Radio, Range, Rating, Select, Signature, Stepper, Array, Textarea, Videos } from "../../form";
import { useMemo } from "react";

export const FormItem = (props) => {
  const Components = useMemo(() => ({ Address, Audios, Boolean, Checkbox, Drawing, Duration, Editor, Files, GpsPoints, IconSelect, Input, MultiNumber, Photos, Radio, Range, Rating, Select, Signature, Stepper, Array, Textarea, Videos }), []);

  const { type } = props;

  // const Component = Components[setComponent(type)];

  // return <Component { ...props} />;
  return "";
};