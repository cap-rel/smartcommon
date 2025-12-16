import { fn } from 'storybook/test';

import { Tag } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/Tag',
  component: Tag,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Others"],
  argTypes: {
    variant: {
      control: "inline-check",
      options: Object.keys(variants),
      table: { category: 'Main' },
    },
    children: {
        table: { category: 'Main' },
    },
    color: {
        table: { category: 'Appearance' },
    },
  },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Tag } from "./stories";
