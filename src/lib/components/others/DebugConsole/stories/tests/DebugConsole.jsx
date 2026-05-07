import { setTestStory } from "../../../../../../storybook";

export const DebugConsole = setTestStory({
    args: {
        defaultOpen: true,
        position: "bottom",
        height: "30vh",
        maxLogs: 200,
        showFab: true,
    },
    props: {
        defaultOpen: null,
        position: null,
        height: null,
        maxLogs: null,
        showFab: null,
    },
    hidden: [],
});
