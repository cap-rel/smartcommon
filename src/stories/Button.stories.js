import { fn } from 'storybook/test';

// import { Button } from './Button';
import { Header } from "./Header";

import { Button } from '../lib';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Components/Others/Button',
  component: Button,
  subcomponents: { Header },
  parameters: {
    options: {
      showPanel: false,
    },
    // docs: {
    //   codePanel: true
    // },
    backgrounds: {
      options: {
        red: { name: 'Red', value: '#f00' },
        green: { name: 'Green', value: '#0f0' },
        blue: { name: 'Blue', value: '#00f' },
      },
    },
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs", "others"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
    // label: {
    //   control: { type: 'select' },
    //   options: ['Normal', 'Bold', 'Italic'],
      // mapping: {
      //   Normal: <p>Bold</p>,
      //   Bold: <b>Bold</b>,
      //   Italic: <i>Italic</i>,
      // },
    // },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary = {
  args: {
    // primary: true,
    // label: 'Button',
  },
};

// export const Secondary = {
//   args: {
//     label: 'Button',
//   },
// };

// export const Large = {
//   args: {
//     size: 'large',
//     label: 'Button',
//   },
// };

// export const Small = {
//   args: {
//     size: 'small',
//     label: 'Button',
//   },
// };
