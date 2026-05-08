import { setDefaultStory } from "../../../../../storybook";

export const WithRememberMe = setDefaultStory({
    args: {
        showEntities: false,
        showSharedDevice: true,
        enableQrPair: false,
    },
    code: `
        import { LoginComponent } from "@cap-rel/smartcommon";

        <LoginComponent
          onSuccess={(user) => navigate("/")}
          showSharedDevice
        />
    `,
});
