import { String } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/String',
  component: String,
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
    value: {
      table: { category: 'Main' },
    },
    underline: {
      table: { category: 'Appearance' },
    },
    uppercase: {
      table: { category: 'Appearance' },
    },
    italic: {
      table: { category: 'Appearance' },
    },
    bold: {
      table: { category: 'Appearance' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { String } from "./stories";
