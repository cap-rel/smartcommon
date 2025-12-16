import { fn } from 'storybook/test';

import { Files } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/Files',
  component: Files,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Formats"],
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
  },
  args: { onClick: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { Files as Fil } from "./stories";

export { Files };
