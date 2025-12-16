import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {},
  code: `
    import { Carousel } from "@cap-rel/smartcommon";

    <Carousel
      id="carousel-default"
    />
  `
});
