import { fn } from "storybook/test";

import { fr } from "lib/locales";

import { setDefaultStory } from "../../../../../storybook";

const breadcrumb = (
    <nav aria-label="Fil d'Ariane" className="text-app-xs text-soft-text">
        <ol className="flex items-center gap-app-xxs">
            <li>Clients</li>
            <li aria-hidden="true">/</li>
            <li>Atelier Martin</li>
        </ol>
    </nav>
);

export const WithBreadcrumb = setDefaultStory({
    args: {
        title: "FA2611-0042",
        subtitle: "Brouillon",
        breadcrumb,
        onBack: fn(),
        labels: fr.DesktopHeader,
        UserMenu: { labels: fr.UserMenu },
    },
    code: `
        import { DesktopHeader, locales } from "@cap-rel/smartcommon";

        <DesktopHeader
          title={invoice.ref}
          subtitle="Brouillon"
          breadcrumb={<Breadcrumb items={["Clients", customer.name]} />}
          onBack={() => navigate(-1)}
          labels={locales.fr.DesktopHeader}
          UserMenu={{ labels: locales.fr.UserMenu }}
        />
    `,
});

WithBreadcrumb.parameters.docs.description = {
    story: "Breadcrumb under the title, French labels for the header (`labels`) and for the embedded UserMenu (`UserMenu` slot).",
};
