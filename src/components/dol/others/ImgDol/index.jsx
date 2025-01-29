import { useState } from "react";

const ImgDol = (props) => {
  const [zoom, setZoom] = useState(false);

  const position = () => { 
    switch (props.position) {
      case "cover":
        return "object-cover";
      default:
        return "object-contain";
    }
  }

  return (
    <div
      className={`${zoom ? "alert-dol" : ""} duration-300`}
      onClick={() => setZoom((prevState) => props.zoomable && !prevState)}
    >
      <div className={`${zoom ? "w-2/3" : props.className}`}>
        <img
          className={`${props.round && "mask mask-circle"} w-full h-full ${position()} ${props.imgClassName}`}
          src={props.src}
          alt={props.alt}
        />
      </div>
    </div>
  );
};

export default ImgDol;
