import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Map } from "../../../dol";

export const MapPage = () => {
  const type = useLocation().state || "search";
  const [center, setCenter] = useState(null);

  return (
    <Map
      type={type}        
      center={center}
    />
  );
};