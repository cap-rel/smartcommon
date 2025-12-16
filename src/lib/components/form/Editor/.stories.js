import { fn } from 'storybook/test';

import { Editor } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/Editor',
  component: Editor,
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
      table: { category: 'Appearance' },
    },
    labelRow: {
      table: { category: 'Appearance' },
    },
    help: {
      table: { category: 'Appearance' },
    },
    value: {
      table: { category: 'Main' },
    },
    defaultValue: {
      table: { category: 'Main' },
    },
    required: {
      table: { category: 'Status' },
    },
    readOnly: {
      table: { category: 'Status' },
    },
    disabled: {
      table: { category: 'Status' },
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
    textareaContainerProps: {
      table: { category: 'Elements' },
    },
    textareaProps: {
      table: { category: 'Elements' },
    },
    htmlProps: {
      table: { category: 'Elements' },
    },
    buttonContainerProps: {
      table: { category: 'Elements' },
    },
    mdButtonProps: {
      table: { category: 'Elements' },
    },
    mdButtonIconProps: {
      table: { category: 'Elements' },
    },
    mdButtonLabelProps: {
      table: { category: 'Elements' },
    },
    htmlButtonProps: {
      table: { category: 'Elements' },
    },
    htmlButtonIconProps: {
      table: { category: 'Elements' },
    },
    htmlButtonLabelProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onValueChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Editor } from "./stories";
