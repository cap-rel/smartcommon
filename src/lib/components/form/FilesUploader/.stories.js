import { fn } from 'storybook/test';

import { FilesUploader } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/FilesUploader',
  component: FilesUploader,
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
      table: { category: 'Main' },
    },
    labelRow: {
      table: { category: 'Main' },
    },
    help: {
      table: { category: 'Main' },
    },
    multiple: {
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
    inputProps: {
      table: { category: 'Elements' },
    },
    listAndButtonsContainerProps: {
      table: { category: 'Elements' },
    },
    listProps: {
      table: { category: 'Elements' },
    },
    listItemProps: {
      table: { category: 'Elements' },
    },
    urlInputProps: {
      table: { category: 'Elements' },
    },
    typeInputProps: {
      table: { category: 'Elements' },
    },
    iconProps: {
      table: { category: 'Elements' },
    },
    titleProps: {
      table: { category: 'Elements' },
    },
    typeProps: {
      table: { category: 'Elements' },
    },
    deleteButtonProps: {
      table: { category: 'Elements' },
    },
    deleteButtonIconProps: {
      table: { category: 'Elements' },
    },
    panelProps: {
      table: { category: 'Elements' },
    },
    fileProps: {
      table: { category: 'Elements' },
    },
    titleInputProps: {
      table: { category: 'Elements' },
    },
    descriptionInputProps: {
      table: { category: 'Elements' },
    },
    buttonProps: {
      table: { category: 'Elements' },
    },
    buttonSpinnerProps: {
      table: { category: 'Elements' },
    },
    buttonIconProps: {
      table: { category: 'Elements' },
    },
    buttonLabelProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onValueChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { FilesUploader } from "./stories";
