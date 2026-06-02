import { fn } from 'storybook/test';

import { Timer } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/Timer',
  component: Timer,
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
    name: {
      table: { category: 'Main' },
    },
    label: {
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
    required: {
      table: { category: 'Status' },
    },
    disabled: {
      table: { category: 'Status' },
    },
    readOnly: {
      table: { category: 'Status' },
    },
    min: {
      table: { category: 'Validation' },
    },
    max: {
      table: { category: 'Validation' },
    },
    showSeconds: {
      table: { category: 'Appearance' },
    },
    maxDays: {
      table: { category: 'Validation' },
    },
    value: {
      table: { category: 'Data' },
    },
    onChange: {
      table: { category: 'Events' },
    },
    defaultValue: {
      table: { category: 'Data' },
    },
    formSubmitted: {
      table: { category: 'Status' },
    },
    onError: {
      table: { category: 'Events' },
    },
    containerProps: {
      table: { category: 'Elements' },
    },
    labelContainerProps: {
      table: { category: 'Elements' },
    },
    iconProps: {
      table: { category: 'Elements' },
    },
    labelProps: {
      table: { category: 'Elements' },
    },
    starProps: {
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
    footerProps: {
      table: { category: 'Elements' },
    },
    helpIconProps: {
      table: { category: 'Elements' },
    },
    helpAndErrorsContainerProps: {
      table: { category: 'Elements' },
    },
    helpProps: {
      table: { category: 'Elements' },
    },
    errorProps: {
      table: { category: 'Elements' },
    },
    durationContainerProps: {
      table: { category: 'Elements' },
    },
    separatorProps: {
      table: { category: 'Elements' },
    },
    cellProps: {
      table: { category: 'Elements' },
    },
    dropdownProps: {
      table: { category: 'Elements' },
    },
    columnsContainerProps: {
      table: { category: 'Elements' },
    },
    columnProps: {
      table: { category: 'Elements' },
    },
    columnHeaderProps: {
      table: { category: 'Elements' },
    },
    columnListProps: {
      table: { category: 'Elements' },
    },
    optionProps: {
      table: { category: 'Elements' },
    },
    okButtonProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { Timer as Tim } from "./stories";

export { Timer } from "./stories";
