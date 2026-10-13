// Becket's font stacks name Inter and JetBrains Mono but the packages ship no
// font files; load them so the catalog renders the intended faces. Kept out of
// preview.ts so tools that bundle preview.ts (the Claude Design sync) don't
// have to load font binaries.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
