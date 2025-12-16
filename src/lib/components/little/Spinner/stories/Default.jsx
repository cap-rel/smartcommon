import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    size: 4
  },
  code: `
    import { Spinner } from "@cap-rel/smartcommon";

    <Spinner
      id="loading-spinner"
      size={4}
    />
  `
});
