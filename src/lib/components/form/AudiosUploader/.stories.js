import { fn } from 'storybook/test';

import { AudiosUploader } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/AudiosUploader',
  component: AudiosUploader,
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
    name: {
      control: false,
      table: { category: 'Main' },
    },
    label: {
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
    value: {
      control: false,
      table: { category: 'Data' },
    },
    onChange: {
      table: { category: 'Events' },
    },
    defaultValue: {
      control: false,
      table: { category: 'Data' },
    },
    formSubmitted: {
      control: false,
      table: { category: 'Status' },
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
    audiosAndButtonContainerProps: {
      table: { category: 'Elements' },
    },
    audiosContainerProps: {
      table: { category: 'Elements' },
    },
    emptyAudioProps: {
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
    audioProps: {
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
    popupImg: {
      table: { category: 'Elements' },
    },
    audioPlayerProps: {
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

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { AudiosUploader } from "./stories";
