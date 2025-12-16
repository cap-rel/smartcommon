import { fn } from 'storybook/test';

import { Array } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/Array',
  component: Array,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Form"],
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
    label: {
      default: "Tags",
      table: { category: 'Appearance' },
    },
    help: {
      table: { category: 'Appearance' },
    },
    icon: {
      control: false,
      table: { category: 'Appearance' },
    },
    prefix: {
      control: false,
      table: { category: 'Appearance' },
    },
    suffix: {
      control: false,
      table: { category: 'Appearance' },
    },
    hasCopyButton: {
      table: { category: 'Appearance' },
    },
    min: {
      table: { category: 'Validation' },
    },
    max: {
      table: { category: 'Validation' },
    },
    name: {
      table: { category: 'Main' },
    },
    defaultValue: {
      table: { category: 'Main' },
    },
    value: {
      table: { category: 'Main' },
    },
    onValueChange: {
      table: { category: 'Events' },
    },
    containerProps: {
      table: { category: 'Elements' },
    },
    labelContainerProps: {
      table: { category: 'Elements' },
    },
    labelProps: {
      table: { category: 'Elements' },
    },
    requiredStarProps: {
      table: { category: 'Elements' },
    },
    helpProps: {
      table: { category: 'Elements' },
    },
    childrenContainerProps: {
      table: { category: 'Elements' },
    },
    prefixProps: {
      table: { category: 'Elements' },
    },
    suffixProps: {
      table: { category: 'Elements' },
    },
    arrayContainerProps: {
      table: { category: 'Elements' },
    },
    arrayInputProps: {
      table: { category: 'Elements' },
    },
    tagsContainerProps: {
      table: { category: 'Elements' },
    },
    tagProps: {
      table: { category: 'Elements' },
    },
    inputProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onValueChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Array } from "./stories";
