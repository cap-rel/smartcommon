import { fn } from 'storybook/test';

import { Range } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/Range',
  component: Range,
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
    rangeMin: {
      table: { category: 'Range' },
    },
    rangeMax: {
      table: { category: 'Range' },
    },
    min: {
      table: { category: 'Validation' },
    },
    max: {
      table: { category: 'Validation' },
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
    name: {
      table: { category: 'Form' },
    },
    value: {
      table: { category: 'Form' },
    },
    defaultValue: {
      table: { category: 'Form' },
    },
    onChange: {
      table: { category: 'Events' },
    },
    formSubmitted: {
      control: false,
      table: { category: 'Form' },
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
    rangeContainerProps: {
      table: { category: 'Elements' },
    },
    inputProps: {
      table: { category: 'Elements' },
    },
    valueProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Range } from "./stories";
