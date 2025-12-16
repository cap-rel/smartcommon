import { Help } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/Help',
  component: Help,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Others"],
  argTypes: {},
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Help } from "./stories";
