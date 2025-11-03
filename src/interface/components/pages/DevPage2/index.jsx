import { Link, useLocation } from "react-router-dom";
import { Page } from "../../../../lib";

export const DevPage2 = () => {
    const location = useLocation();

    return (
        <Page>
            <Link to={"/"}>Bonjour</Link>
        </Page>
    );
};