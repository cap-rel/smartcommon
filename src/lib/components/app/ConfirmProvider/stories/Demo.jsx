import { useState } from "react";

import { Button } from "lib/components";
import { useConfirm } from "lib/hooks";
import { ConfirmProvider } from "../";

const Actions = () => {
    const { confirm, alert } = useConfirm();
    const [result, setResult] = useState(null);

    const askDelete = async () => {
        const ok = await confirm({
            type: "danger",
            title: "Delete this intervention?",
            message: "Its photos and signature are deleted too.",
            confirmText: "Delete",
        });
        setResult(ok ? "confirm() resolved true: delete" : "confirm() resolved false: keep");
    };

    const showInfo = async () => {
        await alert({ type: "info", title: "Synchronised", message: "12 interventions are up to date." });
        setResult("alert() resolved after OK");
    };

    return (
        <div className="flex flex-col gap-app-sm w-72">
            <Button variant="danger" label="Delete..." onClick={askDelete} />
            <Button variant="outline" label="Show an alert" onClick={showInfo} />
            {result && <span className="text-app-sm text-soft-text">{result}</span>}
        </div>
    );
};

export const ConfirmDemo = ({ labels }) => (
    <ConfirmProvider labels={labels}>
        <Actions />
    </ConfirmProvider>
);
