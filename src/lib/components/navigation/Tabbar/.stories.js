import { fn } from 'storybook/test';
import { FaHouse, FaGear, FaUser } from 'react-icons/fa6';

import { Tabbar } from './';
import { TabbarItem } from '../TabbarItem';

import * as variants from "./variants";

export default {
  title: 'Components/Navigation/Tabbar',
  component: Tabbar,
  subcomponents: { TabbarItem },
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
    children: {
      control: false,
      table: { category: 'Main' },
    },
    responsive: {
      table: { category: 'Appearance' },
    },
    hideOnScroll: {
      table: { category: 'Behavior' },
    },
    centralButton: {
      control: false,
      table: { category: 'Appearance' },
    },
    tabbarProps: {
      control: false,
      table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { Tabbar as Tab } from "./stories";

export { Tabbar } from "./stories";
