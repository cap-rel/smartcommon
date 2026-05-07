import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
    args: {
        label: "Add",
        position: "bottom-right",
        size: "md",
        color: "primary",
    },
    code: `
        import { Fab } from "@cap-rel/smartcommon";

        <Fab
          label="Add"
          position="bottom-right"
          color="primary"
          onClick={() => console.log("clicked")}
        />
    `,
});
