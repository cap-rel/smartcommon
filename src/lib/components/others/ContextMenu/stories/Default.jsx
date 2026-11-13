import { setDefaultStory } from "../../../../../storybook";

import { ContextMenuDemo } from "./demo";

export const Default = setDefaultStory({
    args: {},
    code: `
        import { ContextMenu, useContextMenu } from "@cap-rel/smartcommon";

        const ctx = useContextMenu();

        {rows.map((row) => (
          <tr
            key={row.ref}
            tabIndex={0}
            onContextMenu={(e) => ctx.open(e, [
              { label: "Open", icon: <FaFolderOpen />, onClick: () => openInvoice(row) },
              { label: "Send reminder", disabled: row.paid, onClick: () => remind(row) },
              { divider: true },
              { label: "Delete", danger: true, onClick: () => remove(row) },
            ])}
          >
            ...
          </tr>
        ))}

        // once in the page:
        <ContextMenu state={ctx} />
    `,
});

Default.render = (args) => <ContextMenuDemo { ...args } />;
