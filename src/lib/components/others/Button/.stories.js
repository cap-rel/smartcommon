import { fn } from 'storybook/test';

// import { Button } from './Button';
// import { Header } from "../Header/Header";

import { Button } from './';
import { FaApple, FaBook, FaUser } from 'react-icons/fa6';
import { PropsPage } from '../../../../storybook';

import * as variants from "./variants";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Components/Others/Button',
  component: Button,
  // subcomponents: { Header },
  parameters: {
    docs: {
      codePanel: true
    },
    // docs: {
    //   description: {
    //     story: 'Another description, overriding the comments',
    //   },
    // },
    // backgrounds: {
    //   options: {
    //     red: { name: 'Red', value: '#f00' },
    //     green: { name: 'Green', value: '#0f0' },
    //     blue: { name: 'Blue', value: '#00f' },
    //   },
    // },
    layout: 'centered',
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
  args: { onClick: fn() },
};

import { Default as Def, Outlined as Out, Uppercase as Upp } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
export const Outlined = { tags: ["!dev"], ...Out };
export const Uppercase = { tags: ["!dev"], ...Upp };

import { ButtonWithIcon as ButIco } from "./stories";

export const ButtonWithIcon = { name: "Button With Icon", ...ButIco };