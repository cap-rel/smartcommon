import { setDefaultStory } from "../../../../../storybook";

export const WithQrPair = setDefaultStory({
    args: {
        showEntities: false,
        showRememberMe: false,
        enableQrPair: true,
        deviceLabel: "Storybook demo",
        qrPollIntervalMs: 2000,
        qrTimeoutMs: 120000,
    },
    code: `
        import { LoginComponent } from "@cap-rel/smartcommon";

        <LoginComponent
          onSuccess={(user) => navigate("/")}
          enableQrPair
          deviceLabel={navigator.userAgent}
          qrPollIntervalMs={2000}
          qrTimeoutMs={120000}
        />
    `,
});
