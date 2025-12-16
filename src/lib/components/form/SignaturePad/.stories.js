import { fn } from 'storybook/test';

import { SignaturePad } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/SignaturePad',
  component: SignaturePad,
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
    mainContainerProps: {
      table: { category: 'Elements' },
    },
    headerProps: {
      table: { category: 'Elements' },
    },
    EraseButton: {
      table: { category: 'Elements' },
    },
    titleProps: {
      table: { category: 'Elements' },
    },
    ValidateButton: {
      table: { category: 'Elements' },
    },
    signatureContainerProps: {
      table: { category: 'Elements' },
    },
    Pad: {
      table: { category: 'Elements' },
    },
    SignerInput: {
      table: { category: 'Elements' },
    },
  },
  args: { onChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { SignaturePad } from "./stories";
