import { useEffect } from "react";
import { IoGrid, IoGridOutline } from "react-icons/io5";
import { TiThList, TiThListOutline } from "react-icons/ti";
import { RiUserSettingsFill, RiUserSettingsLine } from "react-icons/ri";
import { mToKm, secsToTime } from "../../../../globals/functions";

/**
 * @param {*} props
 * @param {*} onChange (function) Ecoute le changement dans la map
 */
export const Map = (props) => {
  useEffect(() => {
    const map = L.map("map", {
      center: props.center || [46.6031, 1.8883],
      zoom: 5,
    });
    const layer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' });
    map.addLayer(layer);

    if (props.type === "search") {
      const geocoder = L.Control.Geocoder.nominatim();
      const searchControl = L.Control.geocoder({
        geocoder: geocoder,
        collapsed: false,
        placeholder: "Rechercher un lieu...",
        errorMessage: "Aucun résultat trouvé.",
      });
      searchControl.addTo(map);
  
      // const redIcon = new L.Icon({
      //   iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      //   iconSize: [25, 41],
      //   iconAnchor: [12, 41],
      //   popupAnchor: [1, -34],
      //   shadowSize: [41, 41],
      // });
  
      let marker;
      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        if (marker) {
          map.removeLayer(marker);
        }
        marker = L.marker([lat, lng]).addTo(map);

        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await response.json();
        
        if (data) {
          const address = data.address;
          console.log();
          const road = address.road ? `<b>${address.road}</b><br>` : "";
          let postcode = address.postcode ? `<b>${address.postcode}</b>` : "";
          let cityVil = address.city ? `<b>${address.city}</b>` : address.village ? `<b>${address.village}</b>` : "";
          if (!cityVil) {
            postcode = postcode + "<br>";
          } else if(!postcode || (postcode && cityVil)) {
            cityVil = cityVil + "<br>";
          }

          marker.bindPopup(`${road}${postcode} ${cityVil}${address.state || ""} ${address.country || ""}`).openPopup();        
        } else {
          console.log("erreur");
        }
      });
    } else if (props.type === "route") {
      // const latlng = [48.553981, 2.693149];
      // const latlng2 = [48.871577, 2.57102];

      // const marker = L.marker(latlng).addTo(map);
      // const marker2 = L.marker(latlng2).addTo(map);

      const geocoder = L.Control.Geocoder.nominatim();

      const searchControl = L.Control.geocoder({
        geocoder: geocoder,
        collapsed: false,
        placeholder: "Point de départ...",
        errorMessage: "Aucun résultat trouvé.",
      });
      searchControl.addTo(map);

      const searchControl2 = L.Control.geocoder({
        geocoder: geocoder,
        collapsed: false,
        placeholder: "Point d'arrivée...",
        errorMessage: "Aucun résultat trouvé.",
      });
      searchControl2.addTo(map);

      let latlng = null;
      let latlng2 = null;

      searchControl.on('markgeocode', (e) => {
        latlng = e.geocode.center;
        updateRouting(latlng, latlng2);
      });
      
      searchControl2.on('markgeocode', (e) => {
        latlng2 = e.geocode.center;
        updateRouting(latlng, latlng2);
      });
      
      const routing = L.Routing.control({
        routeWhileDragging: true,
        draggableWaypoints: false,
        show: false,
        language: 'fr'
      }).addTo(map);

      document.querySelector('.leaflet-routing-container').style.display = 'none';

      const colors = ['#33FFC7', '#336CFF', '#FF33E9'];

      const updateRouting = (latlng, latlng2) => {
        routing.setWaypoints([
          L.latLng(latlng),
          L.latLng(latlng2)
        ]);

        if (latlng && latlng2) {
          const markersGroup = L.featureGroup([
            L.marker(latlng),
            L.marker(latlng2)
          ]);
    
          map.fitBounds(markersGroup.getBounds());
  
          document.querySelector('.leaflet-routing-container').style.display = 'block';
        } else {
          document.querySelector('.leaflet-routing-container').style.display = 'none';
        }
      }

      let i = 0;
      routing.on("routesfound", (e) => {
        console.log(e.routes);
        e.routes.forEach(route => {
          const line = L.Routing.line(route, { styles: [{ color: colors[i] }] }).addTo(map);
          line.on("click", () => {
            const name = route.name ? `${route.name}<br>` : "";
            const distance = route.summary.totalDistance ? mToKm(route.summary.totalDistance) : "";
            const time = route.summary.totalTime ? secsToTime(route.summary.totalTime) : "";
            line.bindPopup(`${name}${distance} en ${time}`).openPopup();
            L.DomEvent.stopPropagation(e);
          })
          i++
        });
      });
    }
    
  }, [props.type]);

  return (
    <div id="map" className="h-screen w-full text-black z-10"></div>
  );
};
