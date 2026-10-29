import { Button } from "lib/components";
import { openInstallPrompt } from "lib/hooks";
import { InstallPrompt } from "../";

// In an app the prompt shows by itself once the visit threshold is reached;
// here it is opened on demand, the way an "Install the app" menu entry does.
export const InstallPromptDemo = (props) => (
    <div className="flex flex-col gap-app-sm w-72">
        <Button label="Open the install guide" onClick={openInstallPrompt} />
        <InstallPrompt report={false} { ...props } />
    </div>
);
