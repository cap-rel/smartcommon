import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    title: "Block Title",
    children: "Block content here"
  },
  code: `
    import { Block } from "@cap-rel/smartcommon";

    <Block
      id="block-example"
      title="Block Title"
    >
      Block content here
    </Block>
  `
});
