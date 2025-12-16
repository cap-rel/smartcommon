import { fn } from 'storybook/test';
import { FaCheck, FaHeart } from 'react-icons/fa6';

import { Boolean } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/Boolean',
  component: Boolean,
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
      control: { type: 'select' },
      options: ['switch', 'checkbox', 'icon', 'radio'],
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
    name: {
      table: { category: 'Form' },
    },
    value: {
      table: { category: 'Form' },
    },
    onChange: {
      table: { category: 'Events' },
    },
    defaultValue: {
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
    switchProps: {
      control: false,
      table: { category: 'Elements' },
    },
    switchCircleProps: {
      control: false,
      table: { category: 'Elements' },
    },
    checkboxProps: {
      control: false,
      table: { category: 'Elements' },
    },
    checkboxIconProps: {
      control: false,
      table: { category: 'Elements' },
    },
    radioProps: {
      control: false,
      table: { category: 'Elements' },
    },
    checkedIconProps: {
      control: false,
      table: { category: 'Elements' },
    },
  },
  args: { onChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Boolean } from "./stories";
