import { useState } from "react";

import { setDefaultStory } from "../../../../../../storybook";

import { Checkbox } from "../";

// The tools/* primitives receive their `mergeProps` from a parent variant
// merger (Boolean, Checker, ...). Standalone we pass a passthrough that just
// applies each slot's own default props, mirroring the real merger's output.
const passthroughMerge = (_slotKey, build) => build({});

const ControlledCheckbox = (args) => {
    const [checked, setChecked] = useState(args.checked ?? false);
    return (
        <Checkbox
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
        // Usually rendered by <Boolean> / <Checker>, not directly.
        import { Boolean } from "@cap-rel/smartcommon";

        const [checked, setChecked] = useState(false);

        <Boolean value={checked} onChange={setChecked} />
    `,
});

Default.render = (args) => <ControlledCheckbox {...args} />;
