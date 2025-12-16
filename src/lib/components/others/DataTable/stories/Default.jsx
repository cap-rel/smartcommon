import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {},
  code: `
    import { DataTable } from "@cap-rel/smartcommon";

    <DataTable
      id="datatable"
    />
  `
});
