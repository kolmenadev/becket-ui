'use client';

import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react';
import { avatar as avatarRecipe } from '@becket-ui/tokens/recipes';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export type AvatarProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  /** The person's name: the accessible name and the source of the initials. */
  name: string;
  /** Photo URL. Without it, or if it fails to load, the initials show. */
  src?: string;
  /** Fibonacci steps: 20, 32, 52 or 84px. Default `md`. */
  size?: AvatarSize;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0][0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Photo or initials in a circle. Renders without JS; client JS only swaps to
 * the initials when the photo fails to load.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ name, src, size = 'md', className, ...props }, ref) => {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const styles = avatarRecipe({ size });
    const showImage = Boolean(src) && failedSrc !== src;
    return (
      <span ref={ref} role="img" aria-label={name} {...props} className={mergeClassName(styles.root, className)}>
        {showImage ? (
          // The wrapper carries the name; the image itself is decorative.
          <img src={src} alt="" className={styles.image} onError={() => setFailedSrc(src ?? null)} />
        ) : (
          <span aria-hidden="true" className={styles.initials}>
            {initialsOf(name)}
          </span>
        )}
      </span>
    );
  },
);

Avatar.displayName = 'Avatar';
