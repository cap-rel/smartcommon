import { fn } from 'storybook/test';
import { FaCamera } from 'react-icons/fa6';

import { PhotosUploader } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/PhotosUploader',
  component: PhotosUploader,
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
    compressOptions: {
      control: false,
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
      table: { category: 'Form' },
    },
    onError: {
      table: { category: 'Events' },
    },
    containerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    labelContainerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    iconProps: {
      control: false,
      table: { category: 'Elements' },
    },
    labelProps: {
      control: false,
      table: { category: 'Elements' },
    },
    starProps: {
      control: false,
      table: { category: 'Elements' },
    },
    childrenContainerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    prefixProps: {
      control: false,
      table: { category: 'Elements' },
    },
    suffixProps: {
      control: false,
      table: { category: 'Elements' },
    },
    footerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    helpIconProps: {
      control: false,
      table: { category: 'Elements' },
    },
    helpAndErrorsContainerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    helpProps: {
      control: false,
      table: { category: 'Elements' },
    },
    errorProps: {
      control: false,
      table: { category: 'Elements' },
    },
    photosAndButtonContainerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    photosContainerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    emptyPhotoProps: {
      control: false,
      table: { category: 'Elements' },
    },
    buttonsContainerProps: {
      control: false,
      table: { category: 'Elements' },
    },
    CaptureButton: {
      control: false,
      table: { category: 'Elements' },
    },
    ImportButton: {
      control: false,
      table: { category: 'Elements' },
    },
    photoProps: {
      control: false,
      table: { category: 'Elements' },
    },
    imgProps: {
      control: false,
      table: { category: 'Elements' },
    },
    titleProps: {
      control: false,
      table: { category: 'Elements' },
    },
    Popup: {
      control: false,
      table: { category: 'Elements' },
    },
    popupImgProps: {
      control: false,
      table: { category: 'Elements' },
    },
    TitleInput: {
      control: false,
      table: { category: 'Elements' },
    },
    DescriptionTextarea: {
      control: false,
      table: { category: 'Elements' },
    },
    DeleteButton: {
      control: false,
      table: { category: 'Elements' },
    },
  },
  args: { onChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };

export { PhotosUploader } from "./stories";
