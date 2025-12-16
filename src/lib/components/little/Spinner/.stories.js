import { Spinner } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/Spinner',
  component: Spinner,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
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
    size: {
      table: { category: 'Appearance' },
    },
    spinnerProps: {
      control: false,
      table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { Spinner as Spin } from "./stories";

export { Spinner } from "./stories";
