import { fn } from 'storybook/test';

import { Overlay } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/Overlay',
  component: Overlay,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'fullscreen',
  },
  tags: ["Others"],
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
    isOpen: {
      table: { category: 'Status' },
    },
    zIndex: {
      table: { category: 'Appearance' },
    },
    close: {
      table: { category: 'Events' },
    },
    onClick: {
      table: { category: 'Events' },
    },
    overlayProps: {
      table: { category: 'Elements' },
    },
  },
  args: { close: fn(), onClick: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Overlay } from "./stories";
