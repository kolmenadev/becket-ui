import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import '@becket-ui/tokens/index.css';
import { defineBecketTheme } from '@becket-ui/tokens/theme';

export const metadata: Metadata = {
  title: 'Becket UI — Next.js example',
  description: 'App Router consuming packed @becket-ui tarballs',
};

/** Unlayered :root wins over @layer tokens regardless of stylesheet order. */
const brandThemeCss = defineBecketTheme({
  colors: { primary: 'oklch(0.55 0.22 280)' },
  radii: { md: '4px' },
  sizes: { field: '16rem' },
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <style dangerouslySetInnerHTML={{ __html: brandThemeCss }} />
        {children}
      </body>
    </html>
  );
}
