import { KeyboardStickyAction } from "../";

const code = `
    import { KeyboardStickyAction } from "@cap-rel/smartcommon";

    <input type="text" placeholder="Type something..." />
    <KeyboardStickyAction className="p-4 bg-white border-t">
      <button onClick={handleSubmit}>Validate</button>
    </KeyboardStickyAction>
`;

export const Default = {
    args: {
        className: "p-4 bg-white border-t border-gray-200",
    },
    parameters: {
        docs: { source: { code } },
    },
    render: (args) => (
        <div className="flex flex-col gap-3 w-80">
            <input
                type="text"
                placeholder="Type to open keyboard on mobile..."
                className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <KeyboardStickyAction {...args}>
                <button
                    type="button"
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Validate
                </button>
            </KeyboardStickyAction>
        </div>
    ),
};
