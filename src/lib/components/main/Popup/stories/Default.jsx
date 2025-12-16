import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    title: "Popup Title",
    isOpen: true,
    children: "Popup content"
  },
  code: `
    import { Popup } from "@cap-rel/smartcommon";

    <Popup
      title="Popup Title"
      isOpen={true}
      close={() => {}}
    >
      Popup content
    </Popup>
  `
});
