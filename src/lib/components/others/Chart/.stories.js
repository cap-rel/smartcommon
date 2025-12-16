import { fn } from 'storybook/test';

import { Chart } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/Chart',
  component: Chart,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Others"],
  argTypes: {},
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Chart } from "./stories";
