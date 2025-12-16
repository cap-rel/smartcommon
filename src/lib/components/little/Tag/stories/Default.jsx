import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    color: "success",
    children: "Active"
  },
  code: `
    import { Tag } from "@cap-rel/smartcommon";

    <Tag color="success">
      Active
    </Tag>
  `
});
