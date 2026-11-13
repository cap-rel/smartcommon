import { fr } from "lib/locales";

import { setDefaultStory } from "../../../../../storybook";

export const French = setDefaultStory({
    args: {
        labels: fr.UserMenu,
    },
    code: `
        import { UserMenu, locales } from "@cap-rel/smartcommon";

        <UserMenu labels={locales.fr.UserMenu} />
    `,
});

French.parameters.docs.description = {
    story: "Localized labels from the `locales.fr.UserMenu` bundle.",
};
