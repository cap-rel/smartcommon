import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    children: "Page content"
  },
  code: `
    import { Page } from "@cap-rel/smartcommon";

    <Page
      id="default-page"
      responsive={true}
    >
      Page content
    </Page>
  `
});
