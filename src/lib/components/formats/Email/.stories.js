import { Email } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/Email',
  component: Email,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Formats"],
  argTypes: {
    value: {
      control: "text",
      table: { category: 'Main' },
    },
    variant: {
      control: "inline-check",
      options: Object.keys(variants),
      table: { category: 'Main' },
    },
    linkProps: {
      table: { category: 'Elements' },
    },
    iconProps: {
      table: { category: 'Elements' },
    },
    emailProps: {
      table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Email } from "./stories";
