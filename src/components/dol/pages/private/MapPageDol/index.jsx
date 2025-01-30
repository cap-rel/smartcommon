import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MapDol } from "../../../../dol";

export const MapPageDol = () => {
  const type = useLocation().state || "search";
  const [center, setCenter] = useState(null);

  return (
    <MapDol
      type={type}        
      center={center}
    />
  );
};