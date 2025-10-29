import { fn } from 'storybook/test';

import { Button } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Others/Button',
  component: Button,
  // subcomponents: { Header },
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered', // fullscreen
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
    children: { 
        control: false,
        table: { category: 'Main' },
    },
  },
  args: { onClick: fn() },
};

import { Default as Def, Outlined as Out, Uppercase as Upp } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const Outlined = { tags: ["!dev"], ...Out };
export const Uppercase = { tags: ["!dev"], ...Upp };

import { ButtonWithIcon as ButIco, ButtonWithChildren as ButChi } from "./stories";

export { Button } from "./stories";
export const ButtonWithIcon = { name: "Button with Icon", ...ButIco };
export const ButtonWithChildren = { name: "Button with Children", ...ButChi };