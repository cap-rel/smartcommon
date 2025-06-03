// import { Link } from "react-router-dom";
import { timestampToDate } from "../../../globals/functions";
import { Boolean } from "../../form";

const Icon = () => {
  return null;
}

const Link = () => {
  return null;
}

export const ListItem = () => {

    const {
      value,
      type,
    } = props;

    switch (type) {

      case "boolean": return <Boolean checked={value} disabled={true}/>;

      // case "checkbox": return <Checkbox checked={value} disabled={true}/>;

      case "multiCheckbox": return (
        <div className={`gap-2 wrap-v-center`}>
          {value.map((item, IE) => 
            <span key={IE} className={`bg-primary-20 text-primary tag-smt`}>{item}</span>
          )}
        </div>
      );

      case "radio": return value;

      case "select": return value;

      case "multiSelect": return (
        <div className={`gap-2 wrap-v-center`}>
          {value.map((item, IE) => 
            <span key={IE} className={`bg-primary-20 text-primary tag-smt`}>{item}</span>
          )}
        </div>
      );

      case "array": return (
        <div className={`gap-2 wrap-v-center`}>
          {value.map((item, IE) => 
            <>
              <span>{item}</span>
              {IE != value.length - 1 && <span>|</span>}
            </>
          )}
        </div>
      );

      case "varchar": return value;

      case "mail": return <span className={`italic text-smt`}>{value}</span>;

      case "password": return <span className={`font-semibold`}>✱✱✱✱✱✱✱✱✱✱</span>;

      case "phone": return <span className={`font-semibold text-smt`}>{value}</span>;

      case "ip": return value;

      case "link": return <a href={value}>{value}</a>;

      case "int": return value;

      case "reel": return value;

      case "double": return value;

      case "price": return <span className={`font-semibold text-smt`}>{value}</span>

      case "pricey": return <span className={`font-semibold text-smt`}>{value}</span>
      
      case "timestamp": return value;

      case "date": return <span className={`text-smt`}>{value}</span>;

      case "datetime": return <span className={`text-smt`}>{value}</span>;

      case "time": return <span className={`text-smt`}>{value}</span>;

      case "duration": return <span className={`text-smt`}>{value}</span>;

      case "text": return <p className={`overflow-auto max-h-40 text-sm text-justify`}>{value}</p>;

      case "html": return value;

      case "address": return <span className={`text-smt`}>{value}</span>;

      case "gps": return (
        <div className={`rounded-md border divide-x row-v-center divide-smt border-smt`}>
          <div className={`flex-shrink-0 rounded-l-lg divide-y col divide-smt`}>
            <span className={`px-2 pt-2 pb-1`}>Longitude</span>
            <span className={`px-2 pt-1 pb-2`}>Latitude</span>
          </div>
          <div className={`flex-grow divide-y col divide-smt text-smt`}>
            <span className={`px-2 pt-2 pb-1`}>{value[0]}</span>
            <span className={`px-2 pt-1 pb-2`}>{value[1]}</span>
          </div>
        </div>
      );

      case "file": return "";
      case "audio": return "";
      case "video": return ""; 
      case "photo": return "";

      case "signature": return "";
      case "drawing": return "";

      case "color": return "";

      case "stepper": return ""; // un sorte de radio
      case "note": return "";

      // default: return "" TODO à voir avec ERIC
    }
  }

  const Button = (props) => {
    const {
      value,
      type
    } = props;

    switch (type) {
      case "mail": return (
        <button className={`p-2 text-xl text-white bg-orange-500 rounded-md border border-orange-500 button-smt dark:bg-orange-500 dark:bg-opacity-20 dark:text-orange-500`}>
          <Icon library={`md`} name={`MdEmail`} />
        </button>
      );

      case "phone": return (
        <button className={`p-2 text-xl text-white bg-green-500 rounded-md border border-green-500 button-smt dark:bg-green-500 dark:bg-opacity-20 dark:text-green-500`}>
          <Icon library={`fa6`} name={`FaPhone`} />
        </button>
      );

      case "link": return (
        <a className={`p-2 text-xl text-white bg-purple-500 rounded-md border border-purple-500 cursor-pointer button-smt dark:bg-purple-500 dark:bg-opacity-20 dark:text-purple-500`}>
          <Icon library={`fa6`} name={`FaLink`} />
        </a>
      );

      case "date": return (
        <Link className={`p-2 text-xl text-white bg-teal-500 rounded-md border border-teal-500 cursor-pointer button-smt dark:bg-teal-500 dark:bg-opacity-20 dark:text-teal-500`}>
          <Icon library={`fa6`} name={`FaCalendarDays`} />
        </Link>
      );

      case "datetime": return (
        <Link className={`p-2 text-xl text-white bg-teal-500 rounded-md border border-teal-500 button-smt dark:bg-teal-500 dark:bg-opacity-20 dark:text-teal-500`}>
          <Icon library={`fa6`} name={`FaCalendarDays`} />
        </Link>
      );
      
      case "address": return (
        <a className={`p-2 text-xl text-white rounded-md border cursor-pointer button-smt bg-primary border-primary dark:bg-primary-20 dark:text-primary`}>
          <Icon library={`fa6`} name={`FaLocationDot`} />
        </a>
      );

      case "gps": return (
        <a className={`p-2 text-xl text-white rounded-md border button-smt bg-primary border-primary dark:bg-primary-20 dark:text-primary`}>
          <Icon library={`fa6`} name={`FaLocationDot`} />
        </a>
      );

      case "file": return (
        <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
          <Icon library={`fa6`} name={`FaDownload`} />
        </button>
      );

      case "fileMultiple": return (
        <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
          <Icon library={`fa6`} name={`FaDownload`} />
        </button>
      );

      case "audio": return (
        <div className={`gap-1 row-v-center`}>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaPlay`} />
          </button>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaDownload`} />
          </button>
        </div>
      );

      case "audioMultiple": return (
        <div className={`gap-1 row-v-center`}>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaPlay`} />
          </button>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaDownload`} />
          </button>
        </div>
      );

      case "video": return (
        <div className={`gap-1 row-v-center`}>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaPlay`} />
          </button>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaDownload`} />
          </button>
        </div>
      );

      case "videoMultiple": return (
        <div className={`gap-1 row-v-center`}>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaPlay`} />
          </button>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaDownload`} />
          </button>
        </div>
      );

      case "photo": return (
        <div className={`gap-1 row-v-center`}>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`md`} name={`MdOutlineFullscreen`} />
          </button>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaDownload`} />
          </button>
        </div>
      );

      case "photoMultiple": return (
        <div className={`gap-1 row-v-center`}>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`md`} name={`MdOutlineFullscreen`} />
          </button>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaDownload`} />
          </button>
        </div>
      );

      case "signature": return (
        <div className={`gap-1 row-v-center`}>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`md`} name={`MdOutlineFullscreen`} />
          </button>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaDownload`} />
          </button>
        </div>
      );

      case "drawing": return (
        <div className={`gap-1 row-v-center`}>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`md`} name={`MdOutlineFullscreen`} />
          </button>
          <button className={`p-2 text-xl text-white bg-gray-500 rounded-md border border-gray-500 button-smt dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} name={`FaDownload`} />
          </button>
        </div>
      );

      // default: return "" TODO à voir avec ERIC
    
  }
};