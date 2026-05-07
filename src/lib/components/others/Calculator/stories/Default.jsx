import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
    args: {
        title: "Calculator",
        position: "center",
        showFab: false,
        showOverlay: false,
        showHistory: true,
        showMemory: true,
        isOpen: true,
    },
    code: `
        import { Calculator } from "@cap-rel/smartcommon";

        <Calculator
          title="Calculator"
          position="center"
          isOpen={true}
          onResult={(value) => console.log("result:", value)}
        />
    `,
});
