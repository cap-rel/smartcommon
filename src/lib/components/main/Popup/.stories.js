import { fn } from 'storybook/test';

import { Popup } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Main/Popup',
  component: Popup,
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
    title: {
        table: { category: 'Appearance' },
    },
    responsive: {
        table: { category: 'Appearance' },
    },
    overlay: {
        table: { category: 'Appearance' },
    },
    closeButton: {
        table: { category: 'Appearance' },
    },
    isOpen: {
        table: { category: 'Status' },
    },
    closeOnClickOverlay: {
        table: { category: 'Events' },
    },
    close: {
        table: { category: 'Events' },
    },
    Overlay: {
        table: { category: 'Elements' },
    },
    popupBackdrop: {
        table: { category: 'Elements' },
    },
    popupProps: {
        table: { category: 'Elements' },
    },
    titleAndButtonContainerProps: {
        table: { category: 'Elements' },
    },
    titleProps: {
        table: { category: 'Elements' },
    },
    Button: {
        table: { category: 'Elements' },
    },
  },
  args: { close: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { Popup as Pop } from "./stories";

export { Popup } from "./stories";
