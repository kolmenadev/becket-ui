import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { FileUpload, type FileRejection, type FileUploadProps } from './FileUpload';
import { VStack } from './Stack';
import { Text } from './Text';

export default {
  title: 'Forms/FileUpload',
  component: FileUpload,
  args: {
    label: 'Document',
    helperText: 'PDF only, up to 5 MB.',
    accept: '.pdf,application/pdf',
    maxSize: 5_000_000,
    multiple: false,
    invalid: false,
    disabled: false,
  },
  argTypes: {
    label: { control: { type: 'text' } },
    helperText: { control: { type: 'text' } },
    accept: { control: { type: 'text' } },
    maxSize: { control: { type: 'number' } },
    maxFiles: { control: { type: 'number' } },
    multiple: { control: { type: 'boolean' } },
    invalid: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
  parameters: {
    controls: {
      include: ['label', 'helperText', 'accept', 'maxSize', 'maxFiles', 'multiple', 'invalid', 'disabled'],
    },
  },
} satisfies Meta<typeof FileUpload>;

type Story = StoryObj<FileUploadProps>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Multiple: Story = {
  args: {
    label: 'Attachments',
    helperText: 'Up to 3 images or PDFs, 2 MB each.',
    accept: 'image/*,.pdf',
    maxSize: 2_000_000,
    multiple: true,
    maxFiles: 3,
  },
};

export const WithFiles: Story = {
  args: {
    label: 'Attachments',
    multiple: true,
    accept: undefined,
    maxSize: undefined,
    helperText: 'Any file type.',
    defaultFiles: [
      new File(['%PDF-1.7'], 'quarterly-report.pdf', { type: 'application/pdf', lastModified: 1 }),
      new File(['a,b'], 'contacts.csv', { type: 'text/csv', lastModified: 2 }),
    ],
  },
};

export const States: Story = {
  render: (args) => (
    <VStack gap="lg">
      <FileUpload {...args} label="Invalid" invalid helperText="Attach the signed document." />
      <FileUpload {...args} label="Required" required helperText="We can't continue without it." />
    </VStack>
  ),
};

export const WithRejections: Story = {
  render: (args) => {
    const [rejections, setRejections] = useState<FileRejection[]>([]);
    return (
      <VStack gap="sm">
        <FileUpload {...args} multiple maxFiles={2} onFilesReject={setRejections} />
        <Text fontSize="sm" color="muted">
          Last rejected: {rejections.map((rejection) => rejection.file.name).join(', ') || 'none'}
        </Text>
      </VStack>
    );
  },
};
