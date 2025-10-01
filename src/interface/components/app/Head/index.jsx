import { Helmet } from "react-helmet";

export const Head = () => {
    return (
        <Helmet>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
            <link rel="icon" type="image/png" href={""} />
            <meta name="theme-color" content={"#f72d40"} />
            <meta name="background-color" content={"#fff"} />
            <link rel="apple-touch-icon" href={""} sizes="192x192" />
            <link rel="manifest" href="manifest.webmanifest" crossOrigin="use-credentials" /> 
            <title>SmartMaker</title>
        </Helmet>
    );
};