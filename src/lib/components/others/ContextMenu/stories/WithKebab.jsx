import { setDefaultStory } from "../../../../../storybook";

import { ContextMenuDemo } from "./demo";

export const WithKebab = setDefaultStory({
    args: {},
    code: `
        import { ContextMenu, Dropdown, useContextMenu } from "@cap-rel/smartcommon";

        const ctx = useContextMenu();
        const itemsFor = (row) => [ /* same entries for both menus */ ];

        <tr onContextMenu={(e) => ctx.open(e, itemsFor(row))}>
          ...
          <td>
            <Dropdown items={itemsFor(row)} trigger={<button aria-label="Actions"><FaEllipsisVertical /></button>} />
          </td>
        </tr>

        <ContextMenu state={ctx} />
    `,
});

WithKebab.parameters.docs.description = {
    story: "Right-click menu and kebab Dropdown built from the same entries: the right click is a shortcut, the kebab keeps the actions discoverable.",
};

WithKebab.render = (args) => <ContextMenuDemo { ...args } withKebab />;
