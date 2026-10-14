import type { Meta, StoryObj } from '@storybook/react';
import { Code, type CodeProps } from './Code';
import { Text } from './Text';

const meta: Meta<typeof Code> = { title: 'Typography/Code', component: Code };
export default meta;

type Story = StoryObj<CodeProps>;

export const Default: Story = {
  render: () => (
    <Text>
      Import <Code>@becket-ui/tokens/index.css</Code> once at the app entry.
    </Text>
  ),
};
