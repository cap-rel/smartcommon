import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    id: "calendar",
    yearsInterval: [2020, 2030],
  },
  code: `
    import { Calendar } from "@cap-rel/smartcommon";

    <Calendar
      id="calendar"
      yearsInterval={[2020, 2030]}
      onChange={(value) => console.log(value)}
    />
  `
});
