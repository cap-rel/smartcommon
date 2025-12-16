import { Textarea } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/Textarea',
  component: Textarea,
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
    placeholder: {
      table: { category: 'Appearance' },
    },
    rows: {
      table: { category: 'Appearance' },
    },
    cols: {
      table: { category: 'Appearance' },
    },
    wrap: {
      table: { category: 'Appearance' },
    },
    required: {
      table: { category: 'Validation' },
    },
    disabled: {
      table: { category: 'Status' },
    },
    readOnly: {
      table: { category: 'Status' },
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
    name: {
      table: { category: 'Form' },
    },
    value: {
      control: false,
      table: { category: 'Form' },
    },
    onChange: {
      table: { category: 'Events' },
    },
    defaultValue: {
      control: false,
      table: { category: 'Form' },
    },
    formSubmitted: {
      table: { category: 'Form' },
    },
    onError: {
      table: { category: 'Events' },
    },
    containerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    labelContainerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    iconProps: {
      control: false,
      table: { category: 'Elements' },
    },
    labelProps: {
      control: false,
      table: { category: 'Elements' },
    },
    starProps: {
      control: false,
      table: { category: 'Elements' },
    },
    childrenContainerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    prefixProps: {
      control: false,
      table: { category: 'Elements' },
    },
    suffixProps: {
      control: false,
      table: { category: 'Elements' },
    },
    footerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    helpIconProps: {
      control: false,
      table: { category: 'Elements' },
    },
    helpAndErrorsContainerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    helpProps: {
      control: false,
      table: { category: 'Elements' },
    },
    errorProps: {
      control: false,
      table: { category: 'Elements' },
    },
    textareaProps: {
      control: false,
      table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { Textarea as Text } from "./stories";

export { Textarea } from "./stories";
