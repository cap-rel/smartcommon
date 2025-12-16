import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: "Hello World"
  },
  code: `
    import { String } from "@cap-rel/smartcommon";

    <String
      value="Hello World"
    />
  `
});
