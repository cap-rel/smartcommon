import { fn } from 'storybook/test';

import { Gps } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/Gps',
  component: Gps,
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
    multiple: {
      table: { category: 'Appearance' },
    },
    onLocate: {
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
    starProps: {
      table: { category: 'Elements' },
    },
    helpProps: {
      table: { category: 'Elements' },
    },
    buttonContainerProps: {
      table: { category: 'Elements' },
    },
    LocateButton: {
      description: "Props of the locate Button (buttonProps, iconProps, labelProps, Spinner).",
      table: { category: 'Elements' },
    },
    locationProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onLocate: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Gps } from "./stories";
