import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
    args: {
        label: "My device",
    },
    code: `
        import { NotificationToggle } from "@cap-rel/smartcommon";

        <NotificationToggle label="My device" />
    `,
});
