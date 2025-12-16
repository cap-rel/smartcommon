import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: "Lorem ipsum dolor sit amet"
  },
  code: `
    import { Text } from "@cap-rel/smartcommon";

    <Text
      value="Lorem ipsum dolor sit amet"
    />
  `
});
