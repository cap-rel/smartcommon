import { useState } from "react";

import { DebugWarnings } from "../";

const code = `
    import { DebugWarnings } from "@cap-rel/smartcommon";

    // Mount once, somewhere high in the tree (typically inside Provider with debug=true).
    <DebugWarnings />
`;

export const Default = {
    args: {},
    parameters: {
        docs: { source: { code } },
    },
    render: () => <DebugWarningsStory />,
};

const DebugWarningsStory = () => {
    const [showNanInput, setShowNanInput] = useState(false);
    const [showNullInput, setShowNullInput] = useState(false);

    return (
        <div className="p-6 max-w-md flex flex-col gap-3">
            <DebugWarnings />

            <h2 className="text-lg font-semibold">DebugWarnings demo</h2>
            <p className="text-sm text-gray-600">
                DebugWarnings has no UI. Open the browser DevTools console,
                then click a button below to trigger a React warning. You
                should see a structured `[DebugWarnings]` group with the
                suspect element and source location.
            </p>

            <button
                type="button"
                onClick={() => setShowNanInput((v) => !v)}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg"
            >
                Toggle &lt;input value={"{NaN}"} /&gt;
            </button>

            <button
                type="button"
                onClick={() => setShowNullInput((v) => !v)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg"
            >
                Toggle &lt;input value={"{null}"} /&gt;
            </button>

            {showNanInput && (
                <input
                    type="number"
                    value={NaN}
                    onChange={() => {}}
                    className="px-2 py-1 border border-gray-300 rounded"
                />
            )}

            {showNullInput && (
                <input
                    type="text"
                    value={null}
                    onChange={() => {}}
                    className="px-2 py-1 border border-gray-300 rounded"
                />
            )}
        </div>
    );
};
