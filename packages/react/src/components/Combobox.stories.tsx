import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Combobox, type ComboboxOption, type ComboboxProps } from './Combobox';
import { HStack, VStack } from './Stack';
import { Text } from './Text';

const countries: ComboboxOption[] = [
  { value: 'AR', label: 'Argentina' },
  { value: 'AU', label: 'Australia' },
  { value: 'BR', label: 'Brazil' },
  { value: 'CA', label: 'Canada' },
  { value: 'DE', label: 'Germany' },
  { value: 'ES', label: 'Spain' },
  { value: 'FR', label: 'France' },
  { value: 'IS', label: 'Iceland' },
  { value: 'JP', label: 'Japan' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'PT', label: 'Portugal' },
  { value: 'SE', label: 'Sweden' },
];

const products: ComboboxOption[] = [
  { value: 'BLT-M6-20', label: 'BLT-M6-20', description: 'Hex bolt, M6 × 20 mm, zinc plated' },
  { value: 'BLT-M8-30', label: 'BLT-M8-30', description: 'Hex bolt, M8 × 30 mm, stainless' },
  { value: 'NUT-M6', label: 'NUT-M6', description: 'Hex nut, M6, zinc plated' },
  { value: 'NUT-M8', label: 'NUT-M8', description: 'Hex nut, M8, stainless' },
  { value: 'WSH-M6', label: 'WSH-M6', description: 'Flat washer, M6' },
  { value: 'SCR-4X40', label: 'SCR-4X40', description: 'Wood screw, 4 × 40 mm' },
  { value: 'ANC-10', label: 'ANC-10', description: 'Wall anchor, 10 mm', disabled: true },
  { value: 'TAP-50', label: 'TAP-50', description: 'Duct tape, 50 mm × 25 m' },
];

export default {
  title: 'Forms/Combobox',
  component: Combobox,
  args: {
    label: 'Country',
    helperText: 'Type to filter the list.',
    options: countries,
    size: 'md',
    invalid: false,
    disabled: false,
    fullWidth: false,
    placeholder: 'Search countries',
  },
  argTypes: {
    label: { control: { type: 'text' } },
    helperText: { control: { type: 'text' } },
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    invalid: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    required: { control: { type: 'boolean' } },
    fullWidth: { control: { type: 'boolean' } },
    placeholder: { control: { type: 'text' } },
  },
  parameters: {
    controls: {
      include: ['label', 'helperText', 'size', 'invalid', 'disabled', 'required', 'fullWidth', 'placeholder'],
    },
  },
} satisfies Meta<typeof Combobox>;

type Story = StoryObj<ComboboxProps>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: countries[4] },
};

export const Sizes: Story = {
  render: (args) => (
    <VStack gap="md">
      <Combobox {...args} size="sm" label="Small" />
      <Combobox {...args} size="md" label="Medium" />
      <Combobox {...args} size="lg" label="Large" />
    </VStack>
  ),
};

export const States: Story = {
  render: (args) => (
    <HStack gap="lg" align="start" style={{ flexWrap: 'wrap' }}>
      <Combobox {...args} label="Chosen" defaultValue={countries[8]} />
      <Combobox {...args} label="Required" required helperText="Pick the country you ship from." />
      <Combobox {...args} label="Invalid" invalid helperText="Choose a country from the list." />
    </HStack>
  ),
};

export const WithLabelAndDescription: Story = {
  args: {
    label: 'Shipping country',
    helperText: 'Rates and delivery times depend on it.',
    name: 'country',
  },
};

export const TwoLineOptions: Story = {
  args: {
    label: 'Product',
    helperText: 'Search by code or description.',
    placeholder: 'e.g. bolt or BLT',
    options: products,
    fullWidth: true,
  },
};

export const WithSuggestions: Story = {
  args: {
    label: 'Product',
    helperText: 'Open the list to see what you used last.',
    options: products,
    suggestions: products.slice(2, 4),
    suggestionsLabel: 'Recently used',
    resultsLabel: 'All products',
    fullWidth: true,
  },
};

// A fake server: answers after 600 ms, honors the abort signal, and fails for "error".
export const AsyncSearch: Story = {
  args: {
    label: 'Product',
    helperText: 'Results come from the server. Type "error" to see the failure state.',
    placeholder: 'Search products',
    options: undefined,
    suggestions: products.slice(0, 2),
    fullWidth: true,
    onSearch: (query, { signal }) =>
      new Promise<ComboboxOption[]>((resolve, reject) => {
        // style-check keep: the timeout has to exist before the abort listener that clears it.
        const timer = setTimeout(() => {
          if (query.toLowerCase() === 'error') reject(new Error('Search is unavailable'));
          else
            resolve(
              products.filter((product) =>
                `${product.label} ${product.description}`.toLowerCase().includes(query.toLowerCase()),
              ),
            );
        }, 600);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }),
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [country, setCountry] = useState<ComboboxOption | null>(countries[2] ?? null);
    return (
      <VStack gap="sm">
        <Combobox {...args} value={country} onValueChange={setCountry} />
        <Text fontSize="sm" color="muted">
          Value: {country ? country.value : 'none'}
        </Text>
      </VStack>
    );
  },
};
