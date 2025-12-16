import { fn } from 'storybook/test';

import { PhoneNumber } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/PhoneNumber',
  component: PhoneNumber,
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
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { PhoneNumber } from "./stories";
