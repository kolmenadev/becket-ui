import { forwardRef, type ReactNode } from 'react';
import { Icon, type IconProps } from './Icon';

export type GlyphProps = Omit<IconProps, 'children'>;

// Every glyph shares one 24px grid and stroke so they sit together without tuning.
function createGlyph(displayName: string, shapes: ReactNode) {
  const Glyph = forwardRef<HTMLSpanElement, GlyphProps>((props, ref) => (
    <Icon ref={ref} {...props}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {shapes}
      </svg>
    </Icon>
  ));
  Glyph.displayName = displayName;
  return Glyph;
}

export const ChevronDownIcon = /* @__PURE__ */ createGlyph('ChevronDownIcon', <path d="M6 9l6 6 6-6" />);

export const ChevronLeftIcon = /* @__PURE__ */ createGlyph('ChevronLeftIcon', <path d="M15 6l-6 6 6 6" />);

export const ChevronRightIcon = /* @__PURE__ */ createGlyph('ChevronRightIcon', <path d="M9 6l6 6-6 6" />);

export const CloseIcon = /* @__PURE__ */ createGlyph('CloseIcon', <path d="M6 6l12 12M18 6L6 18" />);

export const MenuIcon = /* @__PURE__ */ createGlyph('MenuIcon', <path d="M4 6h16M4 12h16M4 18h16" />);

export const CheckIcon = /* @__PURE__ */ createGlyph('CheckIcon', <path d="M5 12.5l4.5 4.5L19 7" />);

export const CopyIcon = /* @__PURE__ */ createGlyph(
  'CopyIcon',
  <>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
  </>,
);

export const ExternalLinkIcon = /* @__PURE__ */ createGlyph(
  'ExternalLinkIcon',
  <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />,
);

export const LinkIcon = /* @__PURE__ */ createGlyph(
  'LinkIcon',
  <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />,
);

export const SearchIcon = /* @__PURE__ */ createGlyph(
  'SearchIcon',
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </>,
);

export const SunIcon = /* @__PURE__ */ createGlyph(
  'SunIcon',
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </>,
);

export const MoonIcon = /* @__PURE__ */ createGlyph('MoonIcon', <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />);

export const InfoIcon = /* @__PURE__ */ createGlyph(
  'InfoIcon',
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </>,
);

export const WarningIcon = /* @__PURE__ */ createGlyph(
  'WarningIcon',
  <path d="M12 3.5L21.5 20h-19L12 3.5zM12 10v4M12 17h.01" />,
);
