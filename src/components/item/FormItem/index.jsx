import { Address, Audios, Boolean, Duration, Editor, Files, GpsPoints, Input, Photos, Range, Rating, Select, Signature, Array, Textarea, Videos } from "../../form";
import { useMemo } from "react";

export const FormItem = (props) => {
  const Components = useMemo(() => ({ Address, Audios, Boolean, Duration, Editor, Files, GpsPoints, Input, Photos, Range, Rating, Select, Signature, Array, Textarea, Videos }), []);

  const { type } = props;

  // const Component = Components[setComponent(type)];

  // return <Component { ...props} />;
  return "";
};