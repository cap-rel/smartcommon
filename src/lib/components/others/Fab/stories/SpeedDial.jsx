import { FaPen, FaTrash, FaShare } from "react-icons/fa";

import { setDefaultStory } from "../../../../../storybook";

export const SpeedDial = setDefaultStory({
    args: {
        label: "Actions",
        position: "bottom-right",
        size: "md",
        color: "primary",
        direction: "up",
        actions: [
            { icon: FaPen, label: "Edit", color: "primary" },
            { icon: FaShare, label: "Share", color: "secondary" },
            { icon: FaTrash, label: "Delete", color: "neutral" },
        ],
    },
    code: `
        import { Fab } from "@cap-rel/smartcommon";
        import { FaPen, FaTrash, FaShare } from "react-icons/fa";

        <Fab
          label="Actions"
          position="bottom-right"
          direction="up"
          actions={[
            { icon: FaPen, label: "Edit", onClick: () => {} },
            { icon: FaShare, label: "Share", onClick: () => {} },
            { icon: FaTrash, label: "Delete", onClick: () => {} },
          ]}
        />
    `,
});
