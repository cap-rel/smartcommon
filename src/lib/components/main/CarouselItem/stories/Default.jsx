import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {},
  code: `
    import { CarouselItem } from "@cap-rel/smartcommon";

    <CarouselItem
      id="carousel-item"
    />
  `
});
