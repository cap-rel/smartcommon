import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    isOpen: true
  },
  code: `
    import { Overlay } from "@cap-rel/smartcommon";

    <Overlay
      id="main-overlay"
      isOpen={true}
      close={() => console.log("close")}
    />
  `
});
