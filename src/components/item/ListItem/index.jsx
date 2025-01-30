import { Link } from "react-router-dom";
import { timestampToDate } from "../../../globals/functions";
import { Boolean, Checkbox, Icon, Img } from "../../dol";

export const ListItem = () => {

    const {
      value,
      type
    } = props;

    switch (type) {

      case "boolean": return <Boolean checked={value} disabled={true}/>;

      case "checkbox": return <Checkbox checked={value} disabled={true}/>;

      case "multiCheckbox": return (
        <div className={`wrap-v-center gap-2`}>
          {value.map((item, IE) => 
            <span key={IE} className={`bg-primary-20 text-primary tag-dol`}>{item}</span>
          )}
        </div>
      );

      case "radio": return value;

      case "select": return value;

      case "multiSelect": return (
        <div className={`wrap-v-center gap-2`}>
          {value.map((item, IE) => 
            <span key={IE} className={`bg-primary-20 text-primary tag-dol`}>{item}</span>
          )}
        </div>
      );

      case "array": return (
        <div className={`wrap-v-center gap-2`}>
          {value.map((item, IE) => 
            <>
              <span>{item}</span>
              {IE != value.length - 1 && <span>|</span>}
            </>
          )}
        </div>
      );

      case "varchar": return value;

      case "mail": return <span className={`italic text-dol`}>{value}</span>;

      case "password": return <span className={`font-semibold`}>✱✱✱✱✱✱✱✱✱✱</span>;

      case "phone": return <span className={`font-semibold text-dol`}>{value}</span>;

      case "ip": return value;

      case "link": return <a href={value}>{value}</a>;

      case "int": return value;

      case "reel": return value;

      case "double": return value;

      case "price": return <span className={`font-semibold text-dol`}>{value}</span>

      case "pricey": return <span className={`font-semibold text-dol`}>{value}</span>
      
      case "timestamp": return value;

      case "date": return <span className={`text-dol`}>{value}</span>;

      case "datetime": return <span className={`text-dol`}>{value}</span>;

      case "time": return <span className={`text-dol`}>{value}</span>;

      case "duration": return <span className={`text-dol`}>{value}</span>;

      case "text": return <p className={`text-sm max-h-40 text-justify overflow-auto`}>{value}</p>;

      case "html": return value;

      case "address": return <span className={`text-dol`}>{value}</span>;

      case "gps": return (
        <div className={`row-v-center divide-x divide-dol border border-dol rounded-md`}>
          <div className={`col divide-y divide-dol rounded-l-lg flex-shrink-0`}>
            <span className={`pb-1 pt-2 px-2`}>Longitude</span>
            <span className={`pt-1 pb-2 px-2`}>Latitude</span>
          </div>
          <div className={`col divide-y divide-dol text-dol flex-grow`}>
            <span className={`pb-1 pt-2 px-2`}>{value[0]}</span>
            <span className={`pt-1 pb-2 px-2`}>{value[1]}</span>
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
        <button className={`button-dol text-xl bg-orange-500 border border-orange-500 p-2 rounded-md text-white dark:bg-orange-500 dark:bg-opacity-20 dark:text-orange-500`}>
          <Icon library={`md`} icon={`MdEmail`} />
        </button>
      );

      case "phone": return (
        <button className={`button-dol text-xl bg-green-500 border border-green-500 p-2 rounded-md text-white dark:bg-green-500 dark:bg-opacity-20 dark:text-green-500`}>
          <Icon library={`fa6`} icon={`FaPhone`} />
        </button>
      );

      case "link": return (
        <a className={`cursor-pointer button-dol text-xl bg-purple-500 border border-purple-500 p-2 rounded-md text-white dark:bg-purple-500 dark:bg-opacity-20 dark:text-purple-500`}>
          <Icon library={`fa6`} icon={`FaLink`} />
        </a>
      );

      case "date": return (
        <Link className={`cursor-pointer button-dol text-xl bg-teal-500 border border-teal-500 p-2 rounded-md text-white dark:bg-teal-500 dark:bg-opacity-20 dark:text-teal-500`}>
          <Icon library={`fa6`} icon={`FaCalendarDays`} />
        </Link>
      );

      case "datetime": return (
        <Link className={`button-dol text-xl bg-teal-500 border border-teal-500 p-2 rounded-md text-white dark:bg-teal-500 dark:bg-opacity-20 dark:text-teal-500`}>
          <Icon library={`fa6`} icon={`FaCalendarDays`} />
        </Link>
      );
      
      case "address": return (
        <a className={`cursor-pointer button-dol text-xl bg-primary border border-primary p-2 rounded-md text-white dark:bg-primary-20 dark:text-primary`}>
          <Icon library={`fa6`} icon={`FaLocationDot`} />
        </a>
      );

      case "gps": return (
        <a className={`button-dol text-xl bg-primary border border-primary p-2 rounded-md text-white dark:bg-primary-20 dark:text-primary`}>
          <Icon library={`fa6`} icon={`FaLocationDot`} />
        </a>
      );

      case "file": return (
        <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
          <Icon library={`fa6`} icon={`FaDownload`} />
        </button>
      );

      case "fileMultiple": return (
        <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
          <Icon library={`fa6`} icon={`FaDownload`} />
        </button>
      );

      case "audio": return (
        <div className={`row-v-center gap-1`}>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaPlay`} />
          </button>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaDownload`} />
          </button>
        </div>
      );

      case "audioMultiple": return (
        <div className={`row-v-center gap-1`}>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaPlay`} />
          </button>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaDownload`} />
          </button>
        </div>
      );

      case "video": return (
        <div className={`row-v-center gap-1`}>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaPlay`} />
          </button>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaDownload`} />
          </button>
        </div>
      );

      case "videoMultiple": return (
        <div className={`row-v-center gap-1`}>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaPlay`} />
          </button>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaDownload`} />
          </button>
        </div>
      );

      case "photo": return (
        <div className={`row-v-center gap-1`}>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`md`} icon={`MdOutlineFullscreen`} />
          </button>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaDownload`} />
          </button>
        </div>
      );

      case "photoMultiple": return (
        <div className={`row-v-center gap-1`}>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`md`} icon={`MdOutlineFullscreen`} />
          </button>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaDownload`} />
          </button>
        </div>
      );

      case "signature": return (
        <div className={`row-v-center gap-1`}>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`md`} icon={`MdOutlineFullscreen`} />
          </button>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaDownload`} />
          </button>
        </div>
      );

      case "drawing": return (
        <div className={`row-v-center gap-1`}>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`md`} icon={`MdOutlineFullscreen`} />
          </button>
          <button className={`button-dol text-xl bg-gray-500 border border-gray-500 p-2 rounded-md text-white dark:bg-gray-500 dark:bg-opacity-20 dark:text-gray-500`}>
            <Icon library={`fa6`} icon={`FaDownload`} />
          </button>
        </div>
      );

      // default: return "" TODO à voir avec ERIC
    
  }
};