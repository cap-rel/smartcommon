import { Helmet } from "react-helmet";

const Head = () => {
    return (
        <Helmet>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
            <link rel="icon" type="image/png" href={""} />
            <meta name="theme-color" content={"#fff"} />
            <meta name="background-color" content={"#fff"} />
            <link rel="apple-touch-icon" href={""} sizes="192x192" />
            <link rel="manifest" href="manifest.webmanifest" crossorigin="use-credentials" />    
            <title>SmartMaker</title>
        </Helmet>
    );
};

export default Head;