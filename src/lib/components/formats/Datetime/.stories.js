import { fn } from 'storybook/test';

import { Datetime } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/Datetime',
  component: Datetime,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Formats"],
  argTypes: {
    id: {
      control: false,
      table: { category: 'Main' },
    },
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

export { Datetime } from "./stories";
