# Why Becket — and whether it is actually ahead

**Status:** internal positioning + public talking points. Research snapshot: September 2026.  
**Audience:** landing page, README, talks — and an honest answer to “is this actually good, or am I already behind?”

Short answer: **the architecture is on the winning side of 2026. The library is not uniquely first, and it is not a finished market product yet.** Promote the *model* loudly. Do not claim you invented compile-time CSS, beat Tailwind, or already out-catalog Chakra.

Related: [ABOUT.md](./ABOUT.md) (what it is), [BACKLOG.md](./BACKLOG.md) (kit), [PUBLISH.md](./PUBLISH.md) (npm).

---

## The one-line pitch (true)

Becket is a **Chakra-shaped React kit whose styles are real CSS, generated before the app runs.** Consumers import one stylesheet, set `data-theme`, and render semantic HTML. There is no Emotion, no theme provider, and no requirement that the app run Tailwind or Panda.

That combination — **familiar component API + prebuilt CSS + native HTML first** — is the thing worth promoting. Each piece exists elsewhere. The *bundle of all three*, as an npm design system, is still rare.

---

## Is it really that good, or are we already behind?

Both, depending on which axis you measure.

### Ahead (architecture)

| Claim | Why it holds |
| --- | --- |
| Runtime CSS-in-JS is the old default | Emotion / styled-components still dominate *legacy* downloads. New RSC / App Router work overwhelmingly picks static CSS (Tailwind, CSS Modules, Panda, StyleX, vanilla-extract). |
| Chakra did not finish the migration you already made | Chakra v3 recipes were *inspired by* Panda, but v3 still ships **Emotion**. Official FAQ: they kept runtime CSS-in-JS to limit breaking changes. They still hit SSR / streaming hydration issues in 2026. |
| MUI paused the same bet | Pigment CSS (zero-runtime for Material) is **on hold**. MUI is doubling down on Base UI and treating Tailwind / CSS Modules as the practical path. |
| Microsoft is moving the same direction | Fluent UI v9 used Griffel (hybrid AOT). The ecosystem conversation in 2026 is “Griffel-zero”: Tailwind + CSS Modules. |
| SSR / RSC is a first-class fit | Styles are a `.css` file. Class names are strings on the HTML. Layout primitives and Button do not need `"use client"`. Disable JS and the page is still themed. |

You are **not late to the idea**. You are early-to-mid on *shipping a library that actually takes it*. The industry consensus in 2026 is “don’t inject CSS at render time.” Becket was built on that consensus instead of migrating off Emotion later.

### Behind (market and product)

| Gap | Reality |
| --- | --- |
| **Distribution** | shadcn/ui is the default new-React kit (~100k+ GitHub stars, copy-into-repo, Tailwind). That is the gravity well. |
| **Panda kits already exist** | [Park UI](https://park-ui.com) (now under the Chakra org) is Ark + Panda, CLI / copy-paste. [Tark UI](https://tarkui.com) is Ark + Tailwind. You are not the first Panda component story. |
| **“Import CSS and go” is a solved product** | [Mantine v7+](https://mantine.dev/changelog/7-0-0/) dropped Emotion for bundled CSS modules. [Radix Themes](https://www.radix-ui.com/themes/docs/overview/styling) is vanilla CSS + tokens. Bootstrap did this a decade ago. |
| **Catalog** | Becket’s v1 kit is curated and incomplete (see backlog). Chakra / MUI / Mantine / shadcn ship dozens of primitives including overlays you have not built. |
| **Publish** | Packages are 0.1.0 and **not on the public registry** until Phase D. You cannot promote an install that does not work yet. |
| **Proof** | Phase C4 (`apps/next-example`, packed tarballs, view-source with JS off) is the SSR proof. G1 still needs public `becket-ui` (D0) and WCAG 2.2 AA ([MAV-29](https://kolmena.atlassian.net/browse/MAV-29)). Consumer theming code ([MAV-22](https://kolmena.atlassian.net/browse/MAV-22)–[MAV-28](https://kolmena.atlassian.net/browse/MAV-28), [MAV-5](https://kolmena.atlassian.net/browse/MAV-5)) is in repo. |
| **Mindshare** | Tailwind is the skill people already have. Panda is a fraction of that. Promoting “powered by Panda” to Tailwind-native teams is a tax, not a feature, unless you lead with *they do not need Panda*. |

**Verdict for promotion:** lead with *consumer simplicity and SSR*, not with “Panda.” Lead with *Chakra DX without Chakra’s runtime*, not with “we have more components.” Be explicit that v0.1 is a kit, not a 100-component ecosystem.

---

## Does compile-time CSS make SSR and sites faster?

**Yes for the costs that used to belong to CSS-in-JS. No as a magic “faster than every 2026 site.”**

### What actually happens at compile time

Panda scans recipes / patterns / `staticCss` in this repo and writes **atomic CSS** into `@becket-ui/tokens/index.css`. React components call a tiny helper that maps `{ visual: 'primary', size: 'md' }` → a class string like `beckui--button beckui--button--visual_primary …`.

That helper is **not** a style engine. It does not create `<style>` tags, hash CSS, or talk to a cache. Panda’s own docs: CSS is generated at build time; the `styled-system` JS only turns objects into class names. On RSC / Astro-style pre-render, bundlers can often DCE that helper and leave the class string in the HTML.

Becket goes one step further than a typical Panda *app*: **`staticCss.recipes: '*'` pre-generates every recipe variant**, so a consumer **does not run Panda**. They import CSS once.

Measured in this repo (September 2026, current kit):

| `@becket-ui/tokens/index.css` | Size |
| --- | --- |
| Raw | ~53 KB |
| gzip | ~9.6 KB |
| brotli | ~7.5 KB |

That is in the same band as a modest Tailwind build — not a 200 KB design-system dump. Phase B components will grow it; keep a budget (backlog C5).

### Why this helps SSR (the real wins)

1. **The HTML is already styled.** The server emits class names that exist in a stylesheet the browser can download in parallel with HTML. There is no “wait for JS, then inject CSS.”
2. **No style registry.** Emotion/styled-components need a cache, `useServerInsertedHTML`, and careful streaming. Chakra v3 still documents / hits hydration mismatches when Emotion `<style>` tags land inside streamed Suspense chunks (Next 16 Cache Components makes streaming the default). Becket never participates in that protocol.
3. **No FOUC from the styling runtime.** Theme is `data-theme` + CSS variables. First paint does not depend on a JS theme provider hydrating.
4. **RSC-native leaves.** `Button`, `Stack`, `Heading`, `Flex`, `Text` have no `"use client"`. They can render on the server. Only stateful leaves (Switch, Card context, Tooltip, future Dialog/Menu/Tabs) are client islands.
5. **Progressive enhancement.** Native `<button>`, `<input>`, `<select>`, `<dialog>` work with JS disabled. The CSS still applies. That is a speed *and* resilience story.
6. **Less main-thread JS.** You are not shipping Emotion (~15 KB+) plus a theme runtime plus Zag machines on every Button. Less JS → less Total Blocking Time and faster hydration. On mid-range phones this is the difference people feel, not a 2 KB CSS delta.

### What it does *not* automatically do

- **It does not beat Tailwind + shadcn on LCP by existing.** Both deliver static CSS. If they purge unused utilities and you ship every recipe variant, *they* can win CSS bytes on a tiny page.
- **It does not shrink images, fonts, or data.** Inter + JetBrains Mono, hero images, and API payloads still dominate many traces.
- **Panda is not “absolute zero JS.”** Official Panda docs say if you want *absolute* zero JS, use `staticCss` as a utility sheet (or another engine). Becket’s recipe functions still run a cheap class join on the server or client unless the bundler inlines them. That is orders of magnitude cheaper than generating CSS, but it is not “0 bytes of styling JS” in every consumer bundle.
- **`staticCss: '*'` is a deliberate size trade.** You pay a small CSS premium so consumers skip codegen. That is the right trade for an npm library. Call it out; do not pretend the CSS is perfectly tree-shaken per page until you add a Panda-in-the-app path (preset) or PurgeCSS.

### One sentence for a landing page

> Styles compile to a cacheable CSS file. The server sends HTML with class names already on it. The browser paints the design system without waiting for React, Emotion, or a theme provider.

---

## The actual product thesis (use this, not “Panda is magic”)

Becket stacks three decisions most kits pick only one of:

```
Compile-time CSS (Panda recipes → index.css)
        +
Chakra-like authoring (variants, as, Stack/Flex, slots)
        +
Native HTML first (no Zag/Ark on Button/Input/Select)
        +
npm consume (no Tailwind, no panda.config, no copy-paste required)
```

**Consumers who only want components** never touch Panda.  
**Consumers who already run Panda** take `@becket-ui/tokens/preset`.  
**Theming** is CSS variables + `data-theme` on `<html>`, not a React context.

That last point is a 2026 feature: Server Components cannot use a client theme context without a boundary. CSS variables work in both worlds.

---

## Who this is for

Primary user: **a React app that needs a real UI this week**, not a Tailwind design system over the next month.

That includes dogfooding in our own apps. Dogfood is the correct reason to keep the library alive. A public kit that you do not use will rot; a kit you ship into your own products stays honest.

### Tailwind already compiles CSS. It does not do this job.

Tailwind is a **styling language**. Compile-time? Yes — same delivery model as Panda (utilities extracted to a stylesheet). What it does *not* give a small project:

| You want | Tailwind | Becket |
| --- | --- | --- |
| A primary button that exists | You write 15 utilities, or copy shadcn, then own that file forever | `<Button visual="primary">` |
| Reuse across two apps | Extract a package yourself, or copy-paste drift | npm / `file:` of `@becket-ui/react` |
| Change “primary” everywhere | Hunt class strings or rebuild a token layer | One token / recipe |
| Typed variants | `cva` + discipline | Recipes are the API |
| No compiler in the app | You still run Tailwind | Import `index.css` |

The Tailwind tax is **personalizing each component and then making those personalizations reusable**. shadcn makes day 1 fast and day 30 into a fork of 40 files per repo. DaisyUI / Flowbite / Preline are the Tailwind world’s answer (prebuilt `btn btn-primary` classes). They are closer to Becket than raw Tailwind is. They still require Tailwind in the project and they are **class APIs**, not React `as` / ref / variant props.

So: **Tailwind is already doing compile-time CSS. It is not already doing “install a small Chakra-shaped kit and start building the product.”** That second sentence is the product. Compile-time is the implementation detail that keeps it from becoming another Emotion kit.

This positioning makes sense. It is how Chakra and Mantine won small-and-medium React apps — updated so the CSS is a file, not a runtime. Do not compete with Tailwind experts on utility fluency. Compete on **time-to-first-screen** for people who do not want to design a Button.

---

## Should Becket go “zero JS”?

Three different goals get mixed together. Only one is worth chasing for this ICP.

| Meaning | Benefit for small React apps | Do it? |
| --- | --- | --- |
| **A. Zero styling JS** — no Panda `css()` / recipe mapper in the bundle; class names folded at build | Tiny. Recipe lookup is cheap. You will not feel 5–15 KB of class-map helpers on a Vite SPA. | **No, not now.** Fights “no compiler in the consumer.” |
| **B. Zero *unnecessary* client JS** — native HTML for controls; `"use client"` only where state/effects exist | Real. Smaller hydration, RSC-friendly, JS-disabled still looks right. Matches the thesis. | **Yes, keep going.** |
| **C. Zero React** — CSS-only like Bootstrap / DaisyUI | Different product. Loses the typed component API that is the point vs Tailwind. | **No.** |

### What “zero styling JS” would take (A)

Panda’s JS does not generate CSS in the browser. It maps `{ visual: 'primary' }` → class string. Killing that means one of:

1. **Hardcoded class strings** in each component — brittle, untyped, duplicates recipes.
2. **A lookup table generated at Becket build** (`BUTTON['primary']['md']` → string) — doable, ugly, still JS (a dict).
3. **A consumer bundler plugin** (StyleX / Compiled / Bamboo-style fold) — true zero, but every app must run a compiler. That is the opposite of the small-project pitch.
4. **CSS-only class API** (`.beckui-btn.beckui-btn--primary`) — actually zero component JS; you have reinvented DaisyUI and thrown away React DX.

Cost is high, payoff is for Contra-scale profilers, not a 15-page dashboard. Skip A until C5 size-limit says the mapper is a problem.

### What “native-first / less client JS” takes (B) — this is the useful work

Today:

- **Already cheap:** Button, Heading, Text, Flex, Stack, SimpleGrid, Hide, Badge, Tag — no `"use client"`, no hooks. Recipe call only.
- **Over-marked client:** Card and Field use `useContext` / `useId`. That can run in Server Components; `"use client"` is there because they are in the client-hook habit, not because the browser must execute them. Worth tightening later.
- **Needs some JS by nature:** Tooltip (position + portal). Future Menu/Tabs if not native.
- **Could be zero library JS:** Switch as a styled `<input type="checkbox">` (uncontrolled works with no React state; *controlled* state lives in the app either way). Select, Checkbox, Radio, Dialog (`<dialog>`), Drawer — backlog already says native first.

“Zero JS” as a slogan oversells. **“No JS for styling; JS only for behavior the platform does not give you”** is the accurate, promotable bar — and it is what small projects actually feel (less `"use client"` contamination, less hydration, forms that work before React loads).

---

## Competitive landscape

Two layers. Do not mix them in marketing copy.

### A. Styling engines (compile-time / zero-runtime)

These generate CSS at build time. They are **not** component libraries.

| Engine | Who | Model | Notes for Becket |
| --- | --- | --- | --- |
| **[Tailwind CSS](https://tailwindcss.com)** | Tailwind Labs | JIT utilities | The volume winner (~12M+ weekly npm). shadcn’s substrate. Same *delivery* model (static CSS), different *authoring* (classes vs recipes). |
| **[Panda CSS](https://panda-css.com)** | Chakra org | Object styles → atomic CSS + codegen | Becket’s engine. Recipes/slots feel like Chakra/Stitches. Small class-map runtime; CSS is static. |
| **[StyleX](https://stylexjs.com)** | Meta | Atomic, strict merges | Instagram-scale. Constraints are the feature. Poor fit for a small public kit. |
| **[vanilla-extract](https://vanilla-extract.style)** | SEEK et al. | `.css.ts` contracts | Excellent for typed tokens. Styles not colocated. [Braid](https://seek-oss.github.io/braid-design-system/) is the flagship DS. |
| **[Linaria](https://github.com/callstack/linaria)** / wyw-in-js | Callstack | styled-components syntax, extracted | Mature drop-in off Emotion. Less of a token/recipe system. |
| **[Compiled](https://compiledcssinjs.com)** | Atlassian | Compile-time CSS-in-JS | Used in Atlassian products. Extract to atomic sheet. |
| **[Griffel](https://griffel.js.org)** | Microsoft | Runtime + AOT extract | Fluent v9. Industry is exploring leaving it. |
| **Pigment CSS** | MUI | Zero-runtime for MUI | **Paused** (2025–2026). Do not treat as a live competitor. |
| **[Tamagui](https://tamagui.dev)** | independent | Compiler + flattening | Strong on RN+web. Different problem (cross-platform). |
| **Bamboo CSS** | Contra (2026) | Fold `css()` to class names at build | Critique of Panda: ~15 KB class mapper vs ~0.5 KB folded. Relevant if we ever need to shave recipe JS, not a kit competitor. |
| **UnoCSS** | independent | On-demand Tailwind-like | Engine, not a DS. |

**Takeaway:** Compile-time CSS is a crowded, settled category. Becket should not market “we invented static CSS.” Market “we *productized* it as a design system you install.”

### B. Component libraries (what people actually compare you to)

| Library | Styling | Behavior | Install | Closest to Becket? |
| --- | --- | --- | --- | --- |
| **Becket** | Panda, **prebuilt** `index.css` | Native HTML; small hooks | Two npm packages | — |
| **[Park UI](https://park-ui.com)** | Panda | **Ark / Zag** machines | CLI copies source; **app must run Panda** | Same engine, opposite JS and consume model |
| **[Chakra UI v3](https://www.chakra-ui.com)** | **Emotion** (Panda-inspired recipes) | Ark / Zag | npm + provider | Same *API memory*, different runtime |
| **[Tark UI](https://github.com/anubra266/tarkui)** | Tailwind | Ark | Copy-paste | Park’s Tailwind twin |
| **[shadcn/ui](https://ui.shadcn.com)** | Tailwind | Radix / Base UI / React Aria (2026) | Copy into repo | Market default; you own the code; you run Tailwind |
| **[Radix Themes](https://www.radix-ui.com/themes)** | Vanilla CSS + CSS vars | Radix primitives | npm + CSS import | Closest *consume* model (CSS file, no CSS-in-JS) |
| **[Mantine](https://mantine.dev)** (v7+) | Bundled CSS modules | Own components | npm + `styles.css` | Closest *mature* “import CSS once” React DS |
| **MUI / Material** | Emotion; Pigment paused | Own + Base UI | npm + ThemeProvider | Legacy runtime; huge catalog |
| **Ant Design** | cssinjs | Own | npm | Enterprise catalog, runtime styles |
| **Fluent UI v9** | Griffel (AOT optional) | Own | npm | Enterprise; in flux toward CSS |
| **Braid** | vanilla-extract | Own | SEEK-internal-ish public | Typed compile-time DS, not Chakra-like |
| **DaisyUI** | Tailwind plugin (pure CSS classes) | Mostly CSS | Tailwind plugin | CSS-first, not a React API |
| **Bootstrap / Open Props** | Prebuilt CSS | Little JS | CSS | Ancestor of the stylesheet model |

Park UI is the comparison to study, not to fear:

- **They** require Panda in the consumer and copy components in (shadcn-shaped). Accessibility of complex widgets is excellent because Zag is the point.
- **We** ship CSS + npm components. Accessibility of *simple* widgets is the platform’s. We refuse Zag so Button/Field stay server-cheap.
- Different products. Say that out loud: *Park is “bring Panda and own the source.” Becket is “install two packages and import CSS.”*

Mantine / Radix Themes are the comparisons for **consume UX**. If a reviewer says “this is just Mantine,” the reply is: Mantine is a large general-purpose kit with its own visual language. Becket is a **token + recipe design system** with a Chakra-like typed variant API and a Panda preset for teams that already compile CSS-in-JS.

---

## What to say in public (safe claims)

Use these. They are defensible.

1. **“Styles are compiled. The browser gets a stylesheet, not a CSS-in-JS runtime.”**
2. **“No theme provider. Dark/light is `data-theme` and CSS variables.”**
3. **“Most primitives are Server Component–safe. Interactive leaves opt into client JS.”**
4. **“You do not need Tailwind or Panda to use the components.”**
5. **“Chakra-like variants and layout primitives, without Emotion.”**
6. **“Native elements first — a button is a `<button>`.”**
7. **“~10 KB gzip of CSS today for the shipped kit”** (re-measure before every launch).

### Claims to avoid

| Don’t say | Why |
| --- | --- |
| “Zero-runtime, zero JS.” | Panda still maps objects → classes; Tooltip/Switch are JS. |
| “Faster than Tailwind / shadcn.” | Unmeasured, often false on CSS bytes. |
| “The first compile-time design system.” | Mantine, Radix Themes, Braid, Park, Compiled, StyleX all exist. |
| “Chakra without the downsides.” | You also lack Chakra’s catalog, a11y machines, and community. |
| “Park UI but better.” | Park is better at complex a11y widgets *by design*. |
| “RSC-ready” | C4 exists: `apps/next-example` on packed tarballs; view-source / JS off still has recipe classes + CSS. |
| “Accessible” / “WCAG 2.2 AA” | Not true until [MAV-29](https://kolmena.atlassian.net/browse/MAV-29) **and** [MAV-45](https://kolmena.atlassian.net/browse/MAV-45) are Done. Native HTML is not the bar. |

---

## Positioning map (where the white space is)

```
                 Consumer must run a CSS compiler
                    (Tailwind / Panda in the app)
                              ▲
                    shadcn          Park UI
                    Tark UI
                              │
     copy-paste ──────────────┼────────────── npm package
                              │
                    DaisyUI         Becket  ●
                                    Mantine
                                    Radix Themes
                              ▼
                 Prebuilt CSS, no compiler in the app
```

Horizontal: **how you install.** Vertical: **who generates CSS.**

The crowded quadrant in 2026 is top-left (shadcn). The crowded *legacy* quadrant is npm + runtime CSS-in-JS (Chakra v3, MUI).

Becket sits **bottom-right with a Chakra API** — same neighborhood as Mantine and Radix Themes, with a typed recipe system instead of CSS modules or closed vanilla CSS.

That is a real wedge if you say it that way. It is a fake wedge if you say “compile-time CSS” as if shadcn did not already do that.

---

## How this helps sites load faster — talking track (90 seconds)

1. For years, React kits generated CSS **in the browser** (or on the server per request) with Emotion. That extra JS runs on every page, fights React Server Components, and is a common source of hydration bugs.
2. The industry moved to **build-time CSS**: Tailwind, Panda, StyleX, vanilla-extract. The CSS is a file. The HTML just has class names.
3. Most of those tools still make **your app** the compiler. shadcn and Park assume Tailwind or Panda in the repo.
4. Becket compiles the design system **once, in our package**. Apps import `@becket-ui/tokens/index.css` like they used to import Bootstrap. React components only attach class names.
5. Because we style native HTML, a lot of the UI does not need client JavaScript at all. SSR HTML looks correct with JS disabled. That is faster first paint *and* a smaller hydration tax.

Then show: view-source of a server-rendered page, Network panel with one CSS file, React tree with Button as a Server Component.

---

## What would make the story airtight

Do these before a loud launch (they are already on the backlog):

1. **C4 Next example** — landed (`apps/next-example`, packed tarballs, `pnpm example:build`).
2. **C5 size budget** — CI on `index.css` gzip and `@becket-ui/react` dist. Quote numbers from CI, not from memory.
3. **Finish the v1 kit leftovers** — Field-wired Select/Textarea.
4. **Consumer theming (G1)** — [MAV-22](https://kolmena.atlassian.net/browse/MAV-22)–[MAV-28](https://kolmena.atlassian.net/browse/MAV-28). CSS-var rebrand without Panda ([THEMING.md](./THEMING.md)). Code tickets are in repo; G1 still needs public `becket-ui` ([MAV-12](https://kolmena.atlassian.net/browse/MAV-12)).
5. **A11y WCAG 2.2 AA (G1)** — [MAV-29](https://kolmena.atlassian.net/browse/MAV-29) (fixes) + [MAV-45](https://kolmena.atlassian.net/browse/MAV-45) (Vitest + axe-core, no Playwright/Chromatic). Required before 0.1.0. Do not claim “accessible” until both Done.
6. **Publish 0.1.0** — public `becket-ui` (D0) then install command (D1). Blocked on 4–5.
7. **Optional: critical-path story** — document that `staticCss: '*'` ships unused variants; Panda preset is how large apps tree-shake.
8. **Optional: consumer MCP** — [MAV-36](https://kolmena.atlassian.net/browse/MAV-36). Helps AI implement *with* Becket. **Not** a 0.1.0 gate. Spec: [MCP.md](./MCP.md).
9. **Optional: Figma library** — [MAV-49](https://kolmena.atlassian.net/browse/MAV-49). Mirrors `@becket-ui` in Figma. **Not** a 0.1.0 gate. Spec: [FIGMA.md](./FIGMA.md).

---

## Sources (research, September 2026)

**Engines and the 2026 split**

- [Why Panda](https://panda-css.com/docs/overview/why-panda) — RSC broke runtime CSS-in-JS; Panda extracts CSS at build time; codegen is a class-name mapper, not a style injector.
- [Panda styled-system](https://panda-css.com/docs/concepts/styled-system) — explicit: not absolute-zero JS; RSC/Astro can DCE the mapper.
- [Panda static CSS](https://panda-css.com/docs/guides/static) — `staticCss` for HTML / zero-runtime sheets (Becket’s consumer path).
- [The State of CSS-in-JS in 2026 (OpenReplay)](https://blog.openreplay.com/state-css-in-js-2026/) — runtime vs zero-runtime; Tailwind / Panda / StyleX / vanilla-extract as the RSC-safe set.
- [The state of zero-runtime CSS-in-JS, mid-2026](https://dx-styles.dev/blog/state-of-zero-runtime-css-in-js/) — vanilla-extract, StyleX, Linaria, Panda, Pigment paused.
- [CSS-in-JS Arena / Bamboo vs Panda vs StyleX](https://github.com/gajus/css-in-js-arena) — Panda class mapper cost vs true fold-at-build.

**Kits that kept or left runtime CSS-in-JS**

- [Announcing Chakra UI v3](https://www.chakra-ui.com/blog/announcing-v3) — recipes inspired by Panda; **still Emotion**; `npm i @chakra-ui/react @emotion/react`.
- [Chakra #10942](https://github.com/chakra-ui/chakra-ui/issues/10942) — documented Next App Router + streaming / Suspense hydration with Emotion style tags (2026).
- [Mantine v7 changelog](https://mantine.dev/changelog/7-0-0/) — dropped Emotion; ship CSS files for App Router / performance.
- [Pigment CSS status](https://github.com/mui/pigment-css/discussions/424) — paused; MUI focused on Base UI.
- [MUI 2026 update](https://mui.com/blog/2026-and-beyond/) — Pigment on hold.
- [Radix Themes styling](https://www.radix-ui.com/themes/docs/overview/styling) — no `css`/`sx`; vanilla CSS + tokens.
- [Park UI](https://park-ui.com/docs/installation) / [joins Chakra org](https://park-ui.com/blog/park-ui-joins-the-chakra-ui-organization) — Ark + Panda, CLI.
- [Tark UI](https://github.com/anubra266/tarkui) — Ark + Tailwind.
- [Braid + vanilla-extract](https://seek-oss.github.io/braid-design-system/) — compile-time DS in production at SEEK.
- [Atlassian Compiled](https://github.com/atlassian-labs/compiled) — compile-time CSS-in-JS.
- [Tamagui compiler](https://tamagui.dev/docs/intro/compiler-install) — extract to CSS + view flattening.
- [Fluent / Griffel](https://griffel.js.org) — AOT CSS-in-JS; later Tailwind+CSS Modules experiments.

**Market default**

- [shadcn/ui](https://ui.shadcn.com) — copy-paste, Tailwind, now Radix / Base UI / React Aria bases (2026). Static CSS, different install model.

---

## Bottom line

Compile-time CSS **does** help SSR and load time, for a specific and measurable reason: **you stop doing styling work on the critical path.** HTML ships with classes; CSS is a cacheable file; most primitives do not need client JS.

You are **not behind that idea.** Chakra, MUI, and parts of Fluent are still climbing out of runtime CSS-in-JS. You skipped that hole.

You **are** behind the *product* race if the pitch is “another React kit” against shadcn, Chakra, and Mantine. You are **not** behind if the pitch is:

> Install a design system that feels like Chakra, ships like a stylesheet, and leaves React Server Components alone.

Ship the Next example, the rest of the v1 kit, and 0.1.0 on npm before spending the claim in ads. Until then, this document is the source of truth for how to talk about it. Release mechanics: [PUBLISH.md](./PUBLISH.md).
