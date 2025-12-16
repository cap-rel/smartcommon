import { fn } from 'storybook/test';
import { FaHouse, FaHouseChimney } from 'react-icons/fa6';

import { TabbarItem } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Navigation/TabbarItem',
  component: TabbarItem,
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
    responsive: {
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
    label: {
      table: { category: 'Appearance' },
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
      control: false,
      table: { category: 'Elements' },
    },
    iconAndLabelContainerProps: {
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
  },
  args: { onClick: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { TabbarItem as TabIt } from "./stories";

export { TabbarItem } from "./stories";
