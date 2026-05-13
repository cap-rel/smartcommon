import { fn } from 'storybook/test';

import { IconDisplay } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/Icon',
  component: IconDisplay,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Formats"],
  argTypes: {
    variant: {
      control: "inline-check",
      options: Object.keys(variants),
      table: { category: 'Main' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { IconDisplay } from "./stories";
