import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
  args: {},
  code: `
    import { Chart } from "@cap-rel/smartcommon";

    <Chart
      id="chart-example"
    />
  `
});
