import { setDefaultStory } from "../../../../../storybook";

// No `user` prop: the name comes from the global state ("user") provided by
// the story decorator, as it would from the root <Provider>.
export const Default = setDefaultStory({
    args: {},
    code: `
        import { UserMenu } from "@cap-rel/smartcommon";

        // Inside the root <Provider>: user from the global state,
        // Settings -> "/settings", Log out -> useApi().logout().
        <UserMenu />
    `,
});
