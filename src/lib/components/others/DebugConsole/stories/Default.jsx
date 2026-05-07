import { useEffect } from "react";

import { DebugConsole } from "../";
import { createLogger, log } from "../../../../utils";

const code = `
    import { DebugConsole } from "@cap-rel/smartcommon";

    <DebugConsole defaultOpen position="bottom" height="40vh" />
`;

export const Default = {
    args: {
        defaultOpen: true,
        position: "bottom",
        height: "40vh",
        maxLogs: 500,
        showFab: true,
    },
    parameters: {
        docs: { source: { code } },
    },
    render: (args) => <DebugConsoleStory {...args} />,
};

const DebugConsoleStory = (args) => {
    useEffect(() => {
        const myLog = createLogger("StoryDemo");
        log.info("Global log entry");
        myLog.info("Hello from a namespaced logger");
        myLog.warn("This is a warning");
        myLog.error("This is an error", new Error("oops"));
    }, []);

    return (
        <div className="p-8" style={{ minHeight: "60vh" }}>
            <h2 className="text-lg font-semibold">Page content</h2>
            <p className="text-sm text-gray-600 mt-2">
                The debug console appears below. Use the toolbar to filter
                logs by level or namespace.
            </p>
            <DebugConsole {...args} />
        </div>
    );
};
