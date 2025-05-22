import { AddressInput, Boolean, Timer, Editor, FilesUploader, Gps, Input, RangeInput, Rater, Select, SignaturePad, Array, Textarea } from "../../form";
import { useMemo } from "react";

export const FormItem = (props) => {
  const Components = useMemo(() => ({ AddressInput, Boolean, Timer, Editor, FilesUploader, Gps, Input, RangeInput, Rater, Select, SignaturePad, Array, Textarea }), []);

  const { type } = props;

  // const Component = Components[setComponent(type)];

  // return <Component { ...props} />;
  return "";
};