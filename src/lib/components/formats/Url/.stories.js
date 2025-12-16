import { Url } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/Url',
  component: Url,
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
    value: {
        table: { category: 'Main' },
    },
    linkProps: {
        table: { category: 'Elements' },
    },
    iconProps: {
        table: { category: 'Elements' },
    },
    urlProps: {
        table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Url } from "./stories";
