import { Array } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/Array',
  component: Array,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Formats"],
  argTypes: {
    value: {
      table: { category: 'Main' },
    },
    formatItem: {
      control: false,
      table: { category: 'Main' },
    },
    separator: {
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

export { Array } from "./stories";
