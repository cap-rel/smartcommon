import { fn } from 'storybook/test';

import { Input } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/Input',
  component: Input,
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
    help: {
      table: { category: 'Main' },
    },
    name: {
      table: { category: 'Main' },
    },
    placeholder: {
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
    inputIcon: {
      control: false,
      table: { category: 'Appearance' },
    },
    inputMode: {
      table: { category: 'Appearance' },
    },
    size: {
      table: { category: 'Appearance' },
    },
    required: {
      table: { category: 'Validation' },
    },
    min: {
      table: { category: 'Validation' },
    },
    max: {
      table: { category: 'Validation' },
    },
    minLength: {
      table: { category: 'Validation' },
    },
    length: {
      table: { category: 'Validation' },
    },
    maxLength: {
      table: { category: 'Validation' },
    },
    pattern: {
      control: false,
      table: { category: 'Validation' },
    },
    patternMessage: {
      table: { category: 'Validation' },
    },
    disabled: {
      table: { category: 'Status' },
    },
    readOnly: {
      table: { category: 'Status' },
    },
    loading: {
      table: { category: 'Status' },
    },
    value: {
      table: { category: 'Form' },
    },
    defaultValue: {
      table: { category: 'Form' },
    },
    formSubmitted: {
      table: { category: 'Form' },
    },
    onChange: {
      table: { category: 'Events' },
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
    inputContainerProps: {
      table: { category: 'Elements' },
    },
    Spinner: {
      table: { category: 'Elements' },
    },
    inputIconProps: {
      table: { category: 'Elements' },
    },
    inputProps: {
      table: { category: 'Elements' },
    },
    MinusButton: {
      table: { category: 'Elements' },
    },
    PlusButton: {
      table: { category: 'Elements' },
    },
    PasswordButton: {
      table: { category: 'Elements' },
    },
  },
  args: { onChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { Input as Inp } from "./stories";

export { Input } from "./stories";
