import { fn } from 'storybook/test';

import { Panel } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Main/Panel',
  component: Panel,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'fullscreen',
  },
  tags: ["Main"],
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
    position: {
        control: { type: 'select' },
        options: ['bottom', 'right', 'top', 'left'],
        table: { category: 'Appearance' },
    },
    isOpen: {
        table: { category: 'Status' },
    },
    overlay: {
        table: { category: 'Appearance' },
    },
    closeOnClickOverlay: {
        table: { category: 'Behavior' },
    },
    closeOnDrag: {
        table: { category: 'Behavior' },
    },
    duration: {
        table: { category: 'Animation' },
    },
    goBackLimit: {
        table: { category: 'Animation' },
    },
    zIndex: {
        table: { category: 'Appearance' },
    },
    close: {
        table: { category: 'Events' },
    },
    overlayProps: {
        table: { category: 'Elements' },
    },
    panelProps: {
        table: { category: 'Elements' },
    },
    dashProps: {
        table: { category: 'Elements' },
    },
  },
  args: { close: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { Panel as Pan } from "./stories";

export { Panel } from "./stories";
