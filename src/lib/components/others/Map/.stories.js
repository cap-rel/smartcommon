import { Map } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/Map',
  component: Map,
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

export { Map } from "./stories";
