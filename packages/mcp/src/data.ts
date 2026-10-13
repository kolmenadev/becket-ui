import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Example = { name: string; code: string };

export type Component = {
  name: string;
  file: string;
  exports: string[];
  hooks: string[];
  types: string[];
  group: string | null;
  storyTitle: string | null;
  client: boolean;
  summary: string | null;
  recipe: string | null;
  variants: Record<string, string[]> | null;
  dts: string;
  examples: Example[];
};

export type Catalog = {
  package: string;
  version: string;
  components: Component[];
  helpers: { file: string; exports: string[]; types: string[] }[];
};

export type ThemeToken = { token: string; cssVar: string; value: string; light?: string };
export type Theme = Record<string, ThemeToken[]>;

export type Data = { catalog: Catalog; theme: Theme; guidelines: string };

/** Data is generated next to the bundle by scripts/build-data.mjs (dist/data). */
export function loadData(dataDir = join(dirname(fileURLToPath(import.meta.url)), 'data')): Data {
  const read = (file: string) => readFileSync(join(dataDir, file), 'utf8');
  return {
    catalog: JSON.parse(read('catalog.json')) as Catalog,
    theme: JSON.parse(read('theme.json')) as Theme,
    guidelines: read('guidelines.md'),
  };
}
