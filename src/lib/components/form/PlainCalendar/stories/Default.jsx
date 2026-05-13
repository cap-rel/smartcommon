import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {
    id: "plain-calendar",
    yearsInterval: [2020, 2030],
    interval: false,
  },
  code: `
    import { PlainCalendar } from "@cap-rel/smartcommon";

    <PlainCalendar
      id="plain-calendar"
      yearsInterval={[2020, 2030]}
      onChange={(value) => console.log(value)}
    />
  `
});
