import { defineRecipe } from "@pandacss/dev";

export const button = defineRecipe({
    className: 'button',
    description: 'The styles for the Button component',
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
      visual: 'outline',
      size: 'md'
    }
  })