import { useState } from "react";

import { setDefaultStory } from "../../../../../../storybook";

import { Radio } from "../";

// The tools/* primitives receive their `mergeProps` from a parent variant
// merger (RadioBar, Checker, ...). Standalone we pass a passthrough that just
// applies each slot's own default props, mirroring the real merger's output.
const passthroughMerge = (_slotKey, build) => build({});

const ControlledRadio = (args) => {
    const [checked, setChecked] = useState(args.checked ?? false);
    return (
        <Radio
            {...args}
            checked={checked}
            mergeProps={passthroughMerge}
            onClick={() => setChecked((c) => !c)}
        />
    );
};

export const Default = setDefaultStory({
    args: {
        checked: false,
        disabled: false,
    },
    code: `
        // Usually rendered by <RadioBar>, not directly.
        import { RadioBar } from "@cap-rel/smartcommon";

        const [value, setValue] = useState("a");

        <RadioBar
            value={value}
            onChange={setValue}
            options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
        />
    `,
});

Default.render = (args) => <ControlledRadio {...args} />;
