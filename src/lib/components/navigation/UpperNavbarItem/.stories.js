import { fn } from 'storybook/test';
import { FaUser } from 'react-icons/fa6';

import { UpperNavbarItem } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Navigation/UpperNavbarItem',
  component: UpperNavbarItem,
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
    children: {
        control: false,
        table: { category: 'Main' },
    },
    label: {
        default: "Item",
        table: { category: 'Appearance' },
    },
    icon: {
        control: false,
        table: { category: 'Appearance' },
    },
    badge: {
        table: { category: 'Appearance' },
    },
    disabled: {
        table: { category: 'Status' },
    },
    onClick: {
        table: { category: 'Events' },
    },
  },
  args: { onClick: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { UpperNavbarItem } from "./stories";
