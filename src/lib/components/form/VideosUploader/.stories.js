import { fn } from 'storybook/test';

import { VideosUploader } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/VideosUploader',
  component: VideosUploader,
  parameters: {
    docs: {
      codePanel: true
    },
    layout: 'centered',
  },
  tags: ["Form"],
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
    label: {
      default: "Videos",
      table: { category: 'Appearance' },
    },
    help: {
      table: { category: 'Appearance' },
    },
    icon: {
      control: false,
      table: { category: 'Appearance' },
    },
    prefix: {
      control: false,
      table: { category: 'Appearance' },
    },
    suffix: {
      control: false,
      table: { category: 'Appearance' },
    },
    accept: {
      table: { category: 'Configuration' },
    },
    required: {
      table: { category: 'Validation' },
    },
    disabled: {
      table: { category: 'Status' },
    },
    readOnly: {
      table: { category: 'Status' },
    },
    min: {
      table: { category: 'Validation' },
    },
    exact: {
      table: { category: 'Validation' },
    },
    max: {
      table: { category: 'Validation' },
    },
    multiple: {
      table: { category: 'Configuration' },
    },
    name: {
      table: { category: 'Form' },
    },
    value: {
      control: false,
      table: { category: 'Form' },
    },
    onChange: {
      table: { category: 'Events' },
    },
    defaultValue: {
      control: false,
      table: { category: 'Form' },
    },
    formSubmitted: {
      control: false,
      table: { category: 'Form' },
    },
    onError: {
      table: { category: 'Events' },
    },
    containerProps: {
      table: { category: 'Elements' },
    },
    labelContainerProps: {
      table: { category: 'Elements' },
    },
    iconProps: {
      table: { category: 'Elements' },
    },
    labelProps: {
      table: { category: 'Elements' },
    },
    starProps: {
      table: { category: 'Elements' },
    },
    childrenContainerProps: {
      table: { category: 'Elements' },
    },
    prefixProps: {
      table: { category: 'Elements' },
    },
    suffixProps: {
      table: { category: 'Elements' },
    },
    footerProps: {
      table: { category: 'Elements' },
    },
    helpIconProps: {
      table: { category: 'Elements' },
    },
    helpAndErrorsContainerProps: {
      table: { category: 'Elements' },
    },
    helpProps: {
      table: { category: 'Elements' },
    },
    errorProps: {
      table: { category: 'Elements' },
    },
    videosAndButtonContainerProps: {
      table: { category: 'Elements' },
    },
    videosContainerProps: {
      table: { category: 'Elements' },
    },
    emptyVideoProps: {
      table: { category: 'Elements' },
    },
    buttonsContainerProps: {
      table: { category: 'Elements' },
    },
    CaptureButton: {
      table: { category: 'Elements' },
    },
    ImportButton: {
      table: { category: 'Elements' },
    },
    videoProps: {
      table: { category: 'Elements' },
    },
    imgProps: {
      table: { category: 'Elements' },
    },
    titleProps: {
      table: { category: 'Elements' },
    },
    Popup: {
      table: { category: 'Elements' },
    },
    videoPlayerProps: {
      table: { category: 'Elements' },
    },
    TitleInput: {
      table: { category: 'Elements' },
    },
    DescriptionTextarea: {
      table: { category: 'Elements' },
    },
    DeleteButton: {
      table: { category: 'Elements' },
    },
  },
  args: { onChange: fn() },
};

export { VideosUploader } from "./stories";
