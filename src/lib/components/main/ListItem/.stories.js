import { fn } from 'storybook/test';

import { ListItem } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Main/ListItem',
  component: ListItem,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Main"],
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

export { ListItem } from "./stories";
