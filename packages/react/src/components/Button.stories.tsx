import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { button as buttonRecipe } from '@maverick/tokens/recipes'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    visual: { control: { type: 'select' }, options: buttonRecipe.variantMap.visual },
    size:   { control: { type: 'select' }, options: buttonRecipe.variantMap.size },
  },
}
export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: { children: 'Click me', visual: 'solid', size: 'sm' },
}