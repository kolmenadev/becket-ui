import { ElementType, forwardRef } from 'react'
import { button } from '@maverick/tokens/recipes'
import type { ButtonVariantProps } from '@maverick/tokens/recipes'

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & ButtonVariantProps & 
{ as?: ElementType }


export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ visual, size, as: ButtonComponent = 'button', className, ...props }, ref) => {
    return (
      <ButtonComponent
        ref={ref}
        {...props}
        className={button({ visual, size })}
      />
    )
  }
)

Button.displayName = 'Button'