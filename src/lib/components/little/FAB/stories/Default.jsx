import { FaPlus } from "react-icons/fa6";

import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
    args: {
        icon: FaPlus,
        color: "secondary",
        size: 64,
        iconSize: 32,
        position: "bottom-right",
    },
    code: `
        import { FAB } from "@cap-rel/smartcommon";
        import { FaPlus } from "react-icons/fa6";

        <FAB
            icon={FaPlus}
            color="secondary"
            position="bottom-right"
            onClick={() => console.log("add")}
        />
    `,
});
