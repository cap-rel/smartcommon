import { Link, useLocation } from "react-router-dom";
import { Page, Panel } from "../../../../lib";
import { useState } from "react";

export const DevPage2 = () => {
    const location = useLocation();

    const [isPanelOpen, setIsPanelOpen] = useState(false);

    console.log(isPanelOpen);

    return (
        <Page>
            <Link to={"/"}>Bonjour</Link>
            <button onClick={() => setIsPanelOpen(true)}>Open</button>

            <Panel
                isOpen={isPanelOpen}
                close={() => setIsPanelOpen(false)}
            >
                <div className="h-100">

                </div>
            </Panel>
        </Page>
    );
};