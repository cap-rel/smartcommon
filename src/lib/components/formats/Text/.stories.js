import { Text } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/Text',
  component: Text,
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
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Text } from "./stories";
