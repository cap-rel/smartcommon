import { fn } from 'storybook/test';

import { Calendar } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/Calendar',
  component: Calendar,
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
    yearsInterval: {
      table: { category: 'Main' },
    },
    value: {
      control: false,
      table: { category: 'Main' },
    },
    onChange: {
      table: { category: 'Events' },
    },
    onMonthChange: {
      table: { category: 'Events' },
    },
    onYearChange: {
      table: { category: 'Events' },
    },
    containerProps: {
      table: { category: 'Elements' },
    },
    upperContainerProps: {
      table: { category: 'Elements' },
    },
    PreviousButton: {
      table: { category: 'Elements' },
    },
    NextButton: {
      table: { category: 'Elements' },
    },
    monthAndYearContainerProps: {
      table: { category: 'Elements' },
    },
    monthProps: {
      table: { category: 'Elements' },
    },
    yearProps: {
      table: { category: 'Elements' },
    },
    lowerContainerProps: {
      table: { category: 'Elements' },
    },
    weekDayAndNumberContainerProps: {
      table: { category: 'Elements' },
    },
    weekDayProps: {
      table: { category: 'Elements' },
    },
    numberProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Calendar } from "./stories";
