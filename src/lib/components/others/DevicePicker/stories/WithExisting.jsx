import { setDefaultStory } from "../../../../../storybook";

// Returning user with two logical devices already created. The picker
// renders both as clickable cards plus a "+ Nouvel appareil" button to
// fall back to the form.
export const WithExisting = setDefaultStory({
    args: {
        existingDevices: [
            {
                id: 12,
                label: "mon iPhone",
                icon: "phone",
                date_lastseen: "2026-05-11 14:23:00",
                session_count: 3,
            },
            {
                id: 15,
                label: "MacBook bureau",
                icon: "laptop",
                date_lastseen: "2026-05-10 09:00:00",
                session_count: 1,
            },
        ],
    },
    code: `
        import { DevicePicker } from "@cap-rel/smartcommon";

        <DevicePicker
          existingDevices={await api.listUserDevices().then(r => r.devices)}
          onPick={(id) => api.linkUserDevice(id)}
          onCreate={(label, icon) => api.createUserDevice({ label, icon })}
        />
    `,
});
