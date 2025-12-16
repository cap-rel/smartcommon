import { fn } from 'storybook/test';
import { FaWifi, FaParking } from 'react-icons/fa6';

import { Checker } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/Checker',
  component: Checker,
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
    type: {
      control: "select",
      options: ["switch", "checkbox", "icon", "radio"],
      table: { category: 'Appearance' },
    },
    checkedIcon: {
      control: false,
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
    min: {
      table: { category: 'Validation' },
    },
    exact: {
      table: { category: 'Validation' },
    },
    max: {
      table: { category: 'Validation' },
    },
    multiple: {
      table: { category: 'Main' },
    },
    options: {
      control: false,
      table: { category: 'Main' },
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
    optionsContainerProps: {
      table: { category: 'Elements' },
    },
    optionProps: {
      table: { category: 'Elements' },
    },
    optionLabelProps: {
      table: { category: 'Elements' },
    },
    switchProps: {
      table: { category: 'Elements' },
    },
    switchCircleProps: {
      table: { category: 'Elements' },
    },
    checkboxProps: {
      table: { category: 'Elements' },
    },
    checkboxIconProps: {
      table: { category: 'Elements' },
    },
    radioProps: {
      table: { category: 'Elements' },
    },
    checkedIconProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Checker } from "./stories";
