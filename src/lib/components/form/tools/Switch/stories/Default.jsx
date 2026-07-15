import { useState } from "react";

import { setDefaultStory } from "../../../../../../storybook";

import { Switch } from "../";

// The tools/* primitives receive their `mergeProps` from a parent variant
// merger (Boolean, ...). Standalone we pass a passthrough that just applies
// each slot's own default props, mirroring the real merger's output.
const passthroughMerge = (_slotKey, build) => build({});

const ControlledSwitch = (args) => {
    const [checked, setChecked] = useState(args.checked ?? false);
    return (
        <Switch
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
        // Usually rendered by <Boolean type="switch">, not directly.
        import { Boolean } from "@cap-rel/smartcommon";

        const [checked, setChecked] = useState(false);

        <Boolean value={checked} onChange={setChecked} />
    `,
});

Default.render = (args) => <ControlledSwitch {...args} />;
