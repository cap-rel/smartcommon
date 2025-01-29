import { useMemo } from "react";
import { timestampToDate, timestampToDateTime } from "../../../../globals/functions";

  const FilterTagItemDol = (props) => {
    const { type, value } = props;

    switch (type) {
      case "boolean"         : return value ? "vrai" : "faux";
      case "checkbox"        : return value ? "vrai" : "faux";
      case "multiCheckbox": return value.map((val, VI) => `${val} ${VI != value.length - 1 ? "| " : ""}`);
      case "radio"           : return value;
      case "select"          : return value;
      case "multiSelect"  : return value.map((val, VI) => `${val} ${VI != value.length - 1 ? "| " : ""}`);
      case "array"           : return value.map((val, VI) => `${val} ${VI != value.length - 1 ? "| " : ""}`);
      case "varchar"         : return value;
      case "mail"            : return value;
      // case "password"        : return;
      case "phone"           : return value;
      case "ip"              : return value;
      case "link"            : return value;
      case "int"             : return value;
      case "reel"            : return value;
      case "double"          : return value; // TODO
      case "price"           : return value;
      case "pricey"         : return value;
      case "timestamp"       : return value;
      case "date"            : return timestampToDate(value);
      case "datetime"        : return timestampToDateTime(value);
      case "time"            : return value; // TODO
      case "duration"        : return value; // TODO
      // case "text            : return;
      // case "html            : return;
      case "address"         : return value;
      // case "gps             : return;
      // case "file            : return;
      // case "audio           : return;
      // case "video           : return;
      // case "photo           : return;
      // case "signature       : return;
      // case "drawing         : return;
      // case "color           : return;
      case "stepper"         : return value; // TODO
      case "note"            : return value; // TODO
  
      // default: return "" TODO à voir avec ERIC
    };

    return FILTER_TAG_MAP[type];
  };

export default FilterTagItemDol;