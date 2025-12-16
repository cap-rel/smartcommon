import { Page } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Main/Page',
  component: Page,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'fullscreen',
  },
  tags: ["Main"],
  argTypes: {
    id: {
      control: false,
      table: { category: 'Main' },
    },
    responsive: {
      table: { category: 'Main' },
    },
    animations: {
      control: false,
      table: { category: 'Main' },
    },
    children: {
      control: false,
      table: { category: 'Main' },
    },
    pageProps: {
      control: false,
      table: { category: 'Elements' },
    },
    contentProps: {
      control: false,
      table: { category: 'Elements' },
    },
  },
  args: {},
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { Page } from "./stories";
