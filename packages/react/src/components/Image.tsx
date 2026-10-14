import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { image as imageRecipe } from '@becket-ui/tokens/recipes';

type ImageFit = 'cover' | 'contain';
type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ImageProps = Omit<ComponentPropsWithoutRef<'img'>, 'alt'> & {
  /** Required. Describe the image, or pass "" when it's purely decorative. */
  alt: string;
  fit?: ImageFit;
  radius?: ImageRadius;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Native <img>: lazy-loaded and async-decoded by default, no JS. */
export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ fit = 'cover', radius = 'none', loading = 'lazy', decoding = 'async', className, ...props }, ref) => (
    <img
      ref={ref}
      loading={loading}
      decoding={decoding}
      {...props}
      className={mergeClassName(imageRecipe({ fit, radius }), className)}
    />
  ),
);

Image.displayName = 'Image';
