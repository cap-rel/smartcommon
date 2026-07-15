import { FaPlus, FaPen, FaShareNodes, FaTrash } from "react-icons/fa6";

import { setDefaultStory } from "../../../../../storybook";

export const SpeedDial = setDefaultStory({
    args: {
        icon: FaPlus,
        label: "Actions",
        position: "bottom-right",
        direction: "up",
        actions: [
            { icon: FaPen, label: "Edit", color: "primary" },
            { icon: FaShareNodes, label: "Share", color: "secondary" },
            { icon: FaTrash, label: "Delete", color: "neutral" },
        ],
    },
    code: `
        import { FAB } from "@cap-rel/smartcommon";
        import { FaPlus, FaPen, FaShareNodes, FaTrash } from "react-icons/fa6";

        <FAB
            icon={FaPlus}
            label="Actions"
            direction="up"
            actions={[
                { icon: FaPen, label: "Edit", onClick: () => {} },
                { icon: FaShareNodes, label: "Share", onClick: () => {} },
                { icon: FaTrash, label: "Delete", onClick: () => {} },
            ]}
        />
    `,
});
