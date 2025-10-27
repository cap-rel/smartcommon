import { fn } from 'storybook/test';

// import { Button } from './Button';
// import { Header } from "../Header/Header";

import { Button } from './';
import { FaApple, FaBook, FaUser } from 'react-icons/fa6';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Components/Others/Button',
  component: Button,
  // subcomponents: { Header },
  parameters: {
    // docs: {
    //   source: {
    //     transform: (src, { args }) => {
    //        if (args.icon && typeof args.icon === "function") {
    //         const iconName = args.icon.name;
    //         return src.replace(/\(\) => {}/, iconName);
    //       }
    //       return src;
    //     },
    //   },
    // },
    options: {
      showPanel: true,
    },
    // docs: {
    //   codePanel: true
    // },
    // backgrounds: {
    //   options: {
    //     red: { name: 'Red', value: '#f00' },
    //     green: { name: 'Green', value: '#0f0' },
    //     blue: { name: 'Blue', value: '#00f' },
    //   },
    // },
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs", "others"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    id: { 
        control: false,
        table: { category: 'Main' },
    },
    children: { 
        control: false,
        table: { category: 'Main' },
    },
    label: {
        default: "Submit",
        table: { category: 'Appearance' },
    },
    icon: { 
        control: false,
        table: { category: 'Appearance' },
    },
    badge: {
        table: { category: 'Appearance' },
    },
    disabled: { 
        table: { category: 'Status' },
    },
    loading: {
        table: { category: 'Status' },
    },
    onClick: { 
        table: { category: 'Events' },
    },
    buttonProps: { 
        table: { category: 'Elements' },
    },
    Spinner: { 
        table: { category: 'Elements' },
    },
    iconProps: { 
        table: { category: 'Elements' },
    },
    labelProps: { 
        table: { category: 'Elements' },
    },
    badgeProps: { 
        table: { category: 'Elements' },
    },
    // icon: {
    //     control: { type: "select" },
    //     options: {
    //         FaUser: FaUser, 
    //         FaBook: FaBook, 
    //         FaApple: FaApple
    //     }
    // }
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
//   args: { onClick: fn() },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export { Default, Test } from "./stories";

// export const Primary = {
//     args: {}
// };
