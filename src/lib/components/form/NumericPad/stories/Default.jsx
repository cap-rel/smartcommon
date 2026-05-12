import { useState } from "react";

import { setDefaultStory } from "../../../../../storybook";

import { NumericPad } from "../";

const ControlledNumericPad = (args) => {
    const [value, setValue] = useState(args.value ?? "0");
    return <NumericPad {...args} value={value} onChange={setValue} />;
};

export const Default = setDefaultStory({
    args: {
        value: "0",
        mode: "decimal",
        label: "Quantity",
    },
    code: `
        import { NumericPad } from "@cap-rel/smartcommon";

        const [value, setValue] = useState("0");

        <NumericPad
            value={value}
            onChange={setValue}
            mode="decimal"
            label="Quantity"
        />
    `,
});

Default.render = (args) => <ControlledNumericPad {...args} />;
