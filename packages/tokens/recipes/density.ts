/**
 * Component density. Defaults match today's padding.
 * Independent of `--beckui--spacing-*` so denser buttons do not shrink Stack gaps.
 */

export const buttonSizeStyles = {
  sm: {
    fontSize: 'sm',
    paddingInline: 'var(--beckui-button-px-sm)',
    paddingBlock: 'var(--beckui-button-py-sm)',
  },
  md: {
    fontSize: 'md',
    paddingInline: 'var(--beckui-button-px-md)',
    paddingBlock: 'var(--beckui-button-py-md)',
  },
} as const;

export const fieldSizeStyles = {
  sm: {
    fontSize: 'sm',
    paddingInline: 'var(--beckui-field-px-sm)',
    paddingBlock: 'var(--beckui-field-py-sm)',
  },
  md: {
    fontSize: 'md',
    paddingInline: 'var(--beckui-field-px-md)',
    paddingBlock: 'var(--beckui-field-py-md)',
  },
  lg: {
    fontSize: 'lg',
    paddingInline: 'var(--beckui-field-px-lg)',
    paddingBlock: 'var(--beckui-field-py-lg)',
  },
} as const;

export const tagSizeStyles = {
  sm: {
    fontSize: 'xs',
    paddingInline: 'var(--beckui-tag-px-sm)',
    paddingBlock: 'var(--beckui-tag-py-sm)',
  },
  md: {
    fontSize: 'sm',
    paddingInline: 'var(--beckui-tag-px-md)',
    paddingBlock: 'var(--beckui-tag-py-md)',
  },
  lg: {
    fontSize: 'md',
    paddingInline: 'var(--beckui-tag-px-lg)',
    paddingBlock: 'var(--beckui-tag-py-lg)',
  },
} as const;
