import { fn } from 'storybook/test';

import { Sidebar } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Navigation/Sidebar',
  component: Sidebar,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'fullscreen',
  },
  tags: ["Navigation"],
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
    toggleButton: {
      table: { category: 'Main' },
    },
    open: {
      control: false,
      table: { category: 'Main' },
    },
    hideButtonOnScroll: {
      table: { category: 'Main' },
    },
    links: {
      control: false,
      table: { category: 'Main' },
    },
    duration: {
      table: { category: 'Main' },
    },
    children: {
      control: false,
      table: { category: 'Main' },
    },
    Panel: {
      table: { category: 'Elements' },
    },
    Button: {
      table: { category: 'Elements' },
    },
    linkProps: {
      table: { category: 'Elements' },
    },
    iconAndLabelContainerProps: {
      table: { category: 'Elements' },
    },
    iconProps: {
      table: { category: 'Elements' },
    },
    badgeProps: {
      table: { category: 'Elements' },
    },
    labelProps: {
      table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Sidebar } from "./stories";
