import { fn } from 'storybook/test';

import { AddressInput } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/AddressInput',
  component: AddressInput,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Form"],
  argTypes: {
    label: {
      table: { category: 'Appearance' },
    },
    labelRow: {
      table: { category: 'Appearance' },
    },
    help: {
      table: { category: 'Appearance' },
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
    inputContainerProps: {
      table: { category: 'Elements' },
    },
    inputProps: {
      table: { category: 'Elements' },
    },
    inputSpinnerProps: {
      table: { category: 'Elements' },
    },
    inputIconProps: {
      table: { category: 'Elements' },
    },
    listProps: {
      table: { category: 'Elements' },
    },
    listItemProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onValueChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { AddressInput } from "./stories";
