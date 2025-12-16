import { fn } from 'storybook/test';

import { Coordinates } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Formats/Coordinates',
  component: Coordinates,
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
    coordinatesProps: {
      table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { Coordinates as Coord } from "./stories";

export { Coordinates } from "./stories";
