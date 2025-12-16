import { fn } from 'storybook/test';

import { Navbar } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Navigation/Navbar',
  component: Navbar,
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
    title: {
        table: { category: 'Content' },
    },
    left: {
        control: false,
        table: { category: 'Content' },
    },
    right: {
        control: false,
        table: { category: 'Content' },
    },
    bottom: {
        control: false,
        table: { category: 'Content' },
    },
    responsive: {
        table: { category: 'Behavior' },
    },
    hideOnScroll: {
        table: { category: 'Behavior' },
    },
    navbarProps: {
        table: { category: 'Elements' },
    },
    upperNavbarProps: {
        table: { category: 'Elements' },
    },
    leftContainerProps: {
        table: { category: 'Elements' },
    },
    titleProps: {
        table: { category: 'Elements' },
    },
    rightContainerProps: {
        table: { category: 'Elements' },
    },
    bottomContainerProps: {
        table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Navbar } from "./stories";
