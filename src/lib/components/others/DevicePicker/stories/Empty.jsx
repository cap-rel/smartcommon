import { setDefaultStory } from "../../../../../storybook";

// Empty list -> the picker renders the new-device form directly.
export const Empty = setDefaultStory({
    args: {
        existingDevices: [],
    },
    code: `
        import { DevicePicker } from "@cap-rel/smartcommon";

        <DevicePicker
          existingDevices={[]}
          onPick={(id) => api.linkUserDevice(id)}
          onCreate={(label, icon) => api.createUserDevice({ label, icon })}
        />
    `,
});
