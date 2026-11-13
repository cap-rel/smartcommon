import { setDefaultStory } from "../../../../../storybook";

export const WithoutUserMenu = setDefaultStory({
    args: {
        title: "Print preview",
        titleAs: "p",
        showUserMenu: false,
    },
    code: `
        import { DesktopHeader } from "@cap-rel/smartcommon";

        // The screen renders its own <h1>: the header title becomes a <p>.
        <DesktopHeader title="Print preview" titleAs="p" showUserMenu={false} />
    `,
});

WithoutUserMenu.parameters.docs.description = {
    story: "Chrome-less screen: no UserMenu, and `titleAs=\"p\"` because the screen already carries its own `<h1>`.",
};
