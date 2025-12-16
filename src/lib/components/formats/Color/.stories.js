import { fn } from 'storybook/test';

import { Color } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/Color',
  component: Color,
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
    value: {
        table: { category: 'Main' },
    },
  },
  args: { onClick: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { Color as Col } from "./stories";

export { Color };
