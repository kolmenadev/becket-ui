import { defineRecipe } from '@pandacss/dev';

/** Hidden on screen, read by assistive tech. */
export const visuallyHiddenStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
};

export const visuallyHidden = defineRecipe({
  className: 'visuallyHidden',
  description: 'Visually hidden but available to screen readers',
  base: visuallyHiddenStyles,
});
