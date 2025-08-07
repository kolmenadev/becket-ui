import { forwardRef } from 'react'
import { button } from '../../../tokens/styled-system/recipes'

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  visual?: 'solid' | 'outline'
  size?: 'sm' | 'md'
  as?: React.ElementType
}


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