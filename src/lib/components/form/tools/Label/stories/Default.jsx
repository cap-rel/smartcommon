import { setDefaultStory } from "../../../../../../storybook";

import { Label } from "../";

// Label wraps a field. Standalone it needs no mergeProps (built-in fallback),
// so we just give it a plain input as children to show the slot layout.
const LabelDemo = (args) => (
    <Label {...args}>
        <input
            className="border border-gray-300 rounded-md px-2 py-1 w-full outline-none"
            placeholder="john@example.com"
        />
    </Label>
);

export const Default = setDefaultStory({
    args: {
        id: "email",
        label: "Email",
        required: true,
        help: "We never share your email.",
        showErrors: false,
    },
    code: `
        import { Label } from "@cap-rel/smartcommon";

        <Label id="email" label="Email" required help="We never share your email.">
            <input placeholder="john@example.com" />
        </Label>
    `,
});

Default.render = (args) => <LabelDemo {...args} />;
