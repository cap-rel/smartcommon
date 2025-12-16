import { fn } from 'storybook/test';

import { SearchBar } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/SearchBar',
  component: SearchBar,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Others"],
  argTypes: {},
  args: { onClick: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

import { SearchBar as Sea } from "./stories";

export { SearchBar };
