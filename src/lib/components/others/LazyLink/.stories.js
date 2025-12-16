import { fn } from 'storybook/test';

import { LazyLink } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/LazyLink',
  component: LazyLink,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Others"],
  argTypes: {
    to: {
      control: 'text',
      table: { category: 'Main' },
    },
    state: {
      control: 'object',
      table: { category: 'Main' },
    },
    variant: {
      control: "inline-check",
      options: Object.keys(variants),
      table: { category: 'Main' },
    },
    children: {
      control: 'text',
      table: { category: 'Main' },
    },
    duration: {
      control: 'number',
      table: { category: 'Behavior' },
    },
    onClick: {
      table: { category: 'Events' },
    },
    lazyLinkProps: {
      control: 'object',
      table: { category: 'Elements' },
    },
  },
  args: { onClick: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { LazyLink } from "./stories";
