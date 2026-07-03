import { useState } from "react";
import { FaStar } from "react-icons/fa6";

import { setDefaultStory } from "../../../../../../storybook";

import { Icon } from "../";

// The tools/* primitives receive their `mergeProps` from a parent variant
// merger (Checker, ...). Standalone we pass a passthrough that just applies
// each slot's own default props, mirroring the real merger's output.
const passthroughMerge = (_slotKey, build) => build({});

const ControlledIcon = (args) => {
    const [checked, setChecked] = useState(args.checked ?? false);
    return (
        <Icon
            {...args}
            icon={<FaStar />}
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
        // Usually rendered by <Checker>, not directly.
        import { Checker } from "@cap-rel/smartcommon";
        import { FaStar } from "react-icons/fa6";

        const [checked, setChecked] = useState(false);

        <Checker value={checked} onChange={setChecked} icon={<FaStar />} />
    `,
});

Default.render = (args) => <ControlledIcon {...args} />;
