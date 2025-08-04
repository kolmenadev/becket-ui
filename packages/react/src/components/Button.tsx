// @TODO: see why TestBox does generate the static css with css()
// but here cva does not work with the absolute path @maverick/tokens
import { cva } from '../../../tokens/styled-system/css'
// import { cva } from '@maverick/tokens'
import { forwardRef } from 'react'

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  visual?: 'solid' | 'outline'
  size?: 'sm' | 'md'
  as?: React.ElementType
}

const buttonStyles = cva({
  base: {
    fontWeight: 'bold',         
    borderRadius: 'md',             
    px: 4,                        
    py: 2,                        
    transition: 'all 0.2s',
    _focus: { outline: 'none', boxShadow: 'outline' },
    _disabled: { opacity: 0.6, cursor: 'not-allowed' }
  },
  variants: {
    visual: {
      solid: {
        bg: 'primary',           
        color: 'white',             
        _hover: { bg: 'primaryAccent' }
      },
      outline: {
        border: '1px solid',
        borderColor: 'primaryAccent',  
        color: 'primaryAccent',        
        bg: 'transparent',
        _hover: { bg: 'blue.50' } 
      }
    },
    size: {
      sm: { fontSize: 'sm', px: 3, py: 1 },
      md: { fontSize: 'md', px: 4, py: 2 } 
    }
  },
  defaultVariants: {
    visual: 'solid',
    size: 'md'
  }
})

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ visual, size, as: ButtonComponent = 'button', className, ...props }, ref) => {
    return (
      <ButtonComponent
        ref={ref}
        {...props}
        className={buttonStyles({ visual, size })}
      />
    )
  }
)

Button.displayName = 'Button'