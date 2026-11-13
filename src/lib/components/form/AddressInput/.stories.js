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
    onChange: {
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
    starProps: {
      table: { category: 'Elements' },
    },
    helpProps: {
      table: { category: 'Elements' },
    },
    relativeContainerProps: {
      table: { category: 'Elements' },
    },
    Input: {
      description: "Props of the inner Input (inputContainerProps, inputProps, inputIconProps, Spinner...).",
      table: { category: 'Elements' },
    },
    suggestionsContainerProps: {
      table: { category: 'Elements' },
    },
    suggestionProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { AddressInput } from "./stories";
