import toast from "react-hot-toast";

import { Button } from "lib/components";
import { Toaster } from "../";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const ToasterDemo = () => (
    <div className="flex flex-col gap-app-sm w-72">
        <Toaster />
        <Button label="Success" onClick={() => toast.success("Intervention saved")} />
        <Button variant="danger" label="Error" onClick={() => toast.error("The server did not answer")} />
        <Button
            variant="outline"
            label="Loading, then done"
            onClick={() => toast.promise(wait(1500), {
                loading: "Sending the photos...",
                success: "Photos sent",
                error: "Sending failed",
            })}
        />
    </div>
);
