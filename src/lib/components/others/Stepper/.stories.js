import { fn } from 'storybook/test';

import { Stepper } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/Stepper',
  component: Stepper,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Others"],
  argTypes: {
    steps: {
      control: false,
      table: { category: 'Main' },
    },
    title: {
      table: { category: 'Main' },
    },
    header: {
      table: { category: 'Main' },
    },
    footer: {
      table: { category: 'Main' },
    },
    containerProps: {
      table: { category: 'Elements' },
    },
    titleProps: {
      table: { category: 'Elements' },
    },
    headerProps: {
      table: { category: 'Elements' },
    },
    blockProps: {
      table: { category: 'Elements' },
    },
    footerProps: {
      table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Stepper } from "./stories";
