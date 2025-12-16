import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {},
  code: `
    import { Files } from "@cap-rel/smartcommon";

    <Files
      id="files-component"
    />
  `
});
