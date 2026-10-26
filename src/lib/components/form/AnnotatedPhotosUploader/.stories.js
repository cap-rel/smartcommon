import { fn } from 'storybook/test';

import { AnnotatedPhotosUploader } from './';

import * as variants from "./variants";

export default {
  title: 'Components/Form/AnnotatedPhotosUploader',
  component: AnnotatedPhotosUploader,
  parameters: {
    docs: {
      codePanel: true,
      description: {
        component:
          "Multi-photo field where each photo carries its own PhotoAnnotator " +
          "markers. PhotosUploader does the capture, upload and offline queue; " +
          "this component gives each photo a stable uid and an annotate button " +
          "under its thumbnail. Capture stops once `max` photos are taken.",
      },
    },
    layout: 'centered',
  },
  tags: ["Form"],
  argTypes: {
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
    required: {
      table: { category: 'Validation' },
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
    disabled: {
      table: { category: 'Status' },
    },
    readOnly: {
      table: { category: 'Status' },
    },
    outputFormat: {
      control: { type: "select" },
      options: ["base64", "blob", "upload"],
      table: { category: 'Configuration' },
    },
    queue: {
      table: { category: 'Configuration' },
    },
    labels: {
      control: "object",
      table: { category: 'Main' },
    },
    annotationTypes: { table: { disable: true } },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onChange: {
      table: { category: 'Events' },
    },
  },
  args: { onChange: fn() },
};

import { Default as Def } from "./stories";

export const Default = { tags: ["!dev"], ...Def };
