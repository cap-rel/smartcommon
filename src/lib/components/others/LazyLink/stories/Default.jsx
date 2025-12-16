import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    to: "/home",
    children: "Go to Home"
  },
  code: `
    import { LazyLink } from "@cap-rel/smartcommon";

    <LazyLink
      to="/home"
    >
      Go to Home
    </LazyLink>
  `
});
