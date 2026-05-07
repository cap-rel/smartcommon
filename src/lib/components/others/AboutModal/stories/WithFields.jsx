import { setDefaultStory } from "../../../../../storybook";

export const WithFields = setDefaultStory({
    args: {
        open: true,
        appName: "SmartPOS",
        version: "1.0.42",
        fields: [
            { label: "Backend", value: "https://erp.example.com" },
            { label: "User", value: "alice@example.com" },
            { label: "Device", value: "POS-007" },
        ],
        labels: {
            title: "About SmartPOS",
            close: "OK",
            checkUpdates: "Check for updates",
        },
    },
    code: `
        import { AboutModal } from "@cap-rel/smartcommon";

        <AboutModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          appName="SmartPOS"
          version={APP_VERSION}
          fields={[
            { label: "Backend", value: prefixUrl },
            { label: "User", value: user?.email },
            { label: "Device", value: deviceLabel },
          ]}
          labels={{
            title: t("about.title"),
            close: t("common.close"),
            checkUpdates: t("about.check-updates"),
          }}
        />
    `,
});
