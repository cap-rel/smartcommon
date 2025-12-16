import { fn } from 'storybook/test';

import { Block } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Main/Block',
  component: Block,
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
    children: {
        control: false,
        table: { category: 'Main' },
    },
    title: {
        table: { category: 'Appearance' },
    },
    header: {
        table: { category: 'Appearance' },
    },
    footer: {
        table: { category: 'Appearance' },
    },
    responsive: {
        table: { category: 'Status' },
    },
    containerProps: {
        table: { category: 'Elements' },
    },
    titleProps: {
        table: { category: 'Elements' },
    },
    headerProps: {
        table: { category: 'Elements' },
    },
    blockProps: {
        table: { category: 'Elements' },
    },
    footerProps: {
        table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Block } from "./stories";
