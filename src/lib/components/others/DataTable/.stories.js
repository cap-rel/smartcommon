import { fn } from 'storybook/test';

import { DataTable } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/DataTable',
  component: DataTable,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Others"],
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

export { DataTable } from "./stories";
