import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    position: "bottom",
    isOpen: true,
    children: "Panel content"
  },
  code: `
    import { Panel } from "@cap-rel/smartcommon";

    <Panel
      id="default-panel"
      position="bottom"
      isOpen={true}
    >
      Panel content
    </Panel>
  `
});
