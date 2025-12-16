import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {},
  code: `
    import { SearchBar } from "@cap-rel/smartcommon";

    <SearchBar
      id="search-bar"
    />
  `
});
