import { ComponentPropsWithoutRef, ElementType, forwardRef } from 'react'
import { stack } from '../../../tokens/styled-system/recipes'
import { RecipeVariantProps } from '@maverick/tokens/styled-system/types'
import type { StackVariantProps } from '@maverick/tokens/styled-system/recipes/stack'


export const Stack = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'> & StackVariantProps & { as?: ElementType }>(
  (
    {
      direction = 'column',
      gap = "md",
      align,
      justify,
      as: Component = 'div',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={stack({ direction, gap, align, justify })}
        {...props}
      />
    )
  }
)

Stack.displayName = 'Stack'

type StackProps = ComponentPropsWithoutRef<'div'> & 
  RecipeVariantProps<typeof stack> & 
  { as?: ElementType }

export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="row" {...props} />
))
HStack.displayName = 'HStack'

export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="column" {...props} />
))
VStack.displayName = 'VStack'