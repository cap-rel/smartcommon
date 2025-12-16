import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    id: "navbar",
    title: "My App"
  },
  code: `
    import { Navbar } from "@cap-rel/smartcommon";

    <Navbar
      id="navbar"
      title="My App"
    />
  `
});
