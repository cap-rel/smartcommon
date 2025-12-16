import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    value: "https://example.com"
  },
  code: `
    import { Url } from "@cap-rel/smartcommon";

    <Url
      id="example-url"
      value="https://example.com"
    />
  `
});
