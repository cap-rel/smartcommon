import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
    args: {
        showEntities: false,
        showRememberMe: false,
        enableQrPair: false,
    },
    code: `
        import { LoginComponent } from "@cap-rel/smartcommon";

        <LoginComponent onSuccess={(user) => navigate("/")} />
    `,
});
