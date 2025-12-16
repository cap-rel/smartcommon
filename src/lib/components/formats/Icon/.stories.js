import { fn } from 'storybook/test';

import { Icon } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/Icon',
  component: Icon,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Formats"],
  argTypes: {
    variant: {
      control: "inline-check",
      options: Object.keys(variants),
      table: { category: 'Main' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Icon } from "./stories";
