import { Helmet } from "react-helmet";

const Head = (props) => {
    const { app } = props;
    const primary = "#f16c6d";
    return (
        <Helmet>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
            <link rel="icon" type="image/png" href={app.icon} />
            <meta name="theme-color" content={"#fff"} />
            <meta name="background-color" content={"#fff"} />
            <link rel="apple-touch-icon" href={app.icon} sizes="192x192" />
            <link rel="manifest" href="manifest.webmanifest" crossorigin="use-credentials" />
            
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css" />    
            <script defer src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <script defer src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
            <script defer src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"></script>
            
            <title>{app.name}</title>
        </Helmet>
    );
};

export default Head;