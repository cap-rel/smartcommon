import { setDefaultStory } from "../../../../../storybook";

export const Compact = setDefaultStory({
    args: {
        title: "Calc",
        position: "center",
        showFab: false,
        showOverlay: false,
        showHistory: false,
        showMemory: false,
        isOpen: true,
    },
    code: `
        import { Calculator } from "@cap-rel/smartcommon";

        // Compact variant: no history, no memory buttons.
        <Calculator
          title="Calc"
          showHistory={false}
          showMemory={false}
          isOpen={true}
        />
    `,
});
