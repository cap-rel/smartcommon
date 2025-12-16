import { fn } from 'storybook/test';

import { CarouselItem } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Main/CarouselItem',
  component: CarouselItem,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
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
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { CarouselItem } from "./stories";
