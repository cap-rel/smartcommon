import { useState } from "react";

import { setDefaultStory } from "../../../../../storybook";

import { PinPad } from "../";

const ControlledPinPad = (args) => {
    const [value, setValue] = useState(args.value ?? "");
    return <PinPad {...args} value={value} onChange={setValue} />;
};

export const Default = setDefaultStory({
    args: {
        value: "",
        tone: "light",
        minLength: 4,
        maxLength: 8,
    },
    code: `
        import { PinPad } from "@cap-rel/smartcommon";

        const [value, setValue] = useState("");

        <PinPad
            value={value}
            onChange={setValue}
            onSubmit={() => console.log("submit", value)}
            minLength={4}
            maxLength={8}
        />
    `,
});

Default.render = (args) => <ControlledPinPad {...args} />;
