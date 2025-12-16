import { fn } from 'storybook/test';

import { List } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Main/List',
  component: List,
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
    title: {
      table: { category: 'Appearance' },
    },
    children: {
      control: false,
      table: { category: 'Main' },
    },
    responsive: {
      table: { category: 'Behavior' },
    },
    sortProps: {
      control: false,
      table: { category: 'Features' },
    },
    searchProps: {
      control: false,
      table: { category: 'Features' },
    },
    pagination: {
      table: { category: 'Features' },
    },
    containerProps: {
      table: { category: 'Elements' },
    },
    titleProps: {
      table: { category: 'Elements' },
    },
    controlsContainer: {
      table: { category: 'Elements' },
    },
    SearchInput: {
      table: { category: 'Elements' },
    },
    SortButton: {
      table: { category: 'Elements' },
    },
    paginationContainerProps: {
      table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { List } from "./stories";
