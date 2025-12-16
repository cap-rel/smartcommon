import { fn } from 'storybook/test';

import { LowerNavbarItem } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Navigation/LowerNavbarItem',
  component: LowerNavbarItem,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
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
    label: {
      table: { category: 'Appearance' },
    },
    icon: {
      control: false,
      table: { category: 'Appearance' },
    },
    activeIcon: {
      control: false,
      table: { category: 'Appearance' },
    },
    badge: {
      table: { category: 'Appearance' },
    },
    responsive: {
      table: { category: 'Status' },
    },
    active: {
      table: { category: 'Status' },
    },
    disabled: {
      table: { category: 'Status' },
    },
    onClick: {
      table: { category: 'Events' },
    },
    containerProps: {
      table: { category: 'Elements' },
    },
    iconProps: {
      table: { category: 'Elements' },
    },
    labelProps: {
      table: { category: 'Elements' },
    },
  },
  args: { onClick: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { LowerNavbarItem } from "./stories";
