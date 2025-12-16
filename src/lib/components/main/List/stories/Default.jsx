import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    id: "list-example",
    title: "Items"
  },
  code: `
    import { List } from "@cap-rel/smartcommon";

    <List
      id="list-example"
      title="Items"
    >
      {/* Add your list items here */}
    </List>
  `
});
