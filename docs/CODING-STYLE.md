# Coding Style Guide

Applies to all code in this repo: the library, scripts, tests and stories. Code written **with**
Becket (examples, compositions, apps, agent-built screens) also follows
[Writing app code with Becket](../packages/react/guides/building-with-becket.md), which applies
these rules to Becket components. Library-specific rules (API shape, recipes, a11y bar, runtime
tiers) live in [`.cursor-config/becket.mdc`](../.cursor-config/becket.mdc).

Code is read far more often than it is written. Every rule here serves one goal: **a reader should
understand a piece of code top to bottom, in one pass, without jumping around.** When a rule and
that goal conflict, the goal wins; say why in a comment.

Rule strength: **Must** = required in review. **Prefer / Avoid** = the default; deviate with a
reason.

- [Coding](#coding)
  - [Avoid hasty abstraction](#avoid-hasty-abstraction)
  - [Prefer inline logic and styling over abstraction](#prefer-inline-logic-and-styling-over-abstraction)
  - [Prefer inversion of control](#prefer-inversion-of-control)
  - [Prefer to reduce nesting](#prefer-to-reduce-nesting)
  - [Prefer code colocation](#prefer-code-colocation)
  - [Must not mutate function arguments](#must-not-mutate-function-arguments)
  - [Must not mutate arrays or objects you don't own](#must-not-mutate-arrays-or-objects-you-dont-own)
  - [Prefer object parameters when there are more than 2](#prefer-object-parameters-when-there-are-more-than-2)
  - [Prefer native language and platform features first](#prefer-native-language-and-platform-features-first)
  - [Prefer sorted imports](#prefer-sorted-imports)
  - [Must use absolute imports for outer modules](#must-use-absolute-imports-for-outer-modules)
  - [Must use relative imports for inner modules](#must-use-relative-imports-for-inner-modules)
- [Naming](#naming)
  - [Avoid implied keywords in function names](#avoid-implied-keywords-in-function-names)
  - [Initialisms](#initialisms)
  - [Avoid words that are obvious from the type](#avoid-words-that-are-obvious-from-the-type)
  - [Avoid irrelevant details](#avoid-irrelevant-details)
  - [Avoid words that are clear from the surrounding context](#avoid-words-that-are-clear-from-the-surrounding-context)
  - [Avoid words that could apply to any identifier](#avoid-words-that-could-apply-to-any-identifier)
  - [Prefer descriptive names](#prefer-descriptive-names)
  - [Name consistency](#name-consistency)
- [Commenting](#commenting)
  - [Comment why, not how](#comment-why-not-how)
  - [TODO comments must have a ticket number](#todo-comments-must-have-a-ticket-number)
- [React](#react)
  - [Prefer design-system components over raw elements](#prefer-design-system-components-over-raw-elements)
  - [Prefer derived values over synced state](#prefer-derived-values-over-synced-state)
  - [Use effects only to sync with something outside React](#use-effects-only-to-sync-with-something-outside-react)
  - [Must use stable keys](#must-use-stable-keys)
  - [Name props `onX` and handlers `handleX`](#name-props-onx-and-handlers-handlex)
  - [Prefer native, accessible elements](#prefer-native-accessible-elements)
- [TypeScript](#typescript)
  - [Must not use `any`](#must-not-use-any)
  - [Prefer unions and `as const` over enums](#prefer-unions-and-as-const-over-enums)
  - [Prefer inference inside, explicit types at boundaries](#prefer-inference-inside-explicit-types-at-boundaries)
  - [Must explain when ignoring a lint or TypeScript rule](#must-explain-when-ignoring-a-lint-or-typescript-rule)
- [Testing](#testing)
  - [Test behavior the way a user sees it](#test-behavior-the-way-a-user-sees-it)

# Coding

## Avoid hasty abstraction

**Prefer** duplication over the wrong abstraction: duplication is far cheaper to undo. **Avoid**
abstracting until code repeats a third time
([Rule of 3](<https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)>)). By the third
copy a real pattern has emerged, and you can name it accurately.

**Why?**

- Abstraction has a readability cost: the reader has to hold several pieces in their head and
  assemble them.
- The wrong abstraction makes change risky. Every caller now depends on its quirks.
- Naming an abstraction is hard, and the name is less accurate than the code it hides.
- Abstractions make dead code easy to leave behind.

When the third copy does appear, extract the smallest thing that removes the duplication, and keep
it next to its callers ([colocation](#prefer-code-colocation)).

This covers **named constants, helper functions and types** too, not only shared modules. A name
used once is an abstraction with one caller: to read one line, the reader jumps to its definition
and back. Write the value or the logic where it's used, and put the reason in a comment there.

```ts
// Avoid: a constant and a helper, each used once, defined far from their only caller
const HUE_APART = 30;
const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
// …40 lines later
if (picked.some((other) => hueGap(other.h, candidate.h) < HUE_APART)) continue;

// Prefer: the value and its reason where they're used
// Brand colors are different hues; a tint ramp (one hue, many lightnesses) is one brand color.
const tooClose = picked.some((other) => {
  const gap = Math.abs(other.h - candidate.h);
  return Math.min(gap, 360 - gap) < 30;
});
```

Keep a name when it's used three or more times, when a function calls itself, or when it's part
of a public API. Before you commit, check each new top-level `const`, function and type: if it has
one caller, inline it.

**Related reads**

- https://kentcdodds.com/blog/aha-programming
- https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction

## Prefer inline logic and styling over abstraction

The JSX version of [Avoid hasty abstraction](#avoid-hasty-abstraction). Style with the design
system's **props**, written inline where the element is used. Don't create named styled wrappers,
one-off CSS classes or style objects that the reader has to look up.

```tsx
// Avoid: three named wrappers the reader has to look up before reading the list
const UserListContainer = styled(Box)`
  padding: 16px;
  max-width: 326px;
`;
const UserRow = styled(Grid)`
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
`;
const userNameStyle = { color: "#8a8a8a", fontWeight: 600 };

function UserList({ users }: { users: User[] }) {
  return (
    <UserListContainer>
      {users.map((user) => (
        <UserRow key={user.id}>
          <span style={userNameStyle}>{user.name}</span>
          <span>{user.score}</span>
        </UserRow>
      ))}
    </UserListContainer>
  );
}

// Prefer: reads top to bottom like a book; every visual decision is a prop with a token value
function UserList({ users }: { users: User[] }) {
  return (
    <Stack gap="md">
      {users.map((user) => (
        <SimpleGrid key={user.id} columns={2} gap="lg">
          <Text color="muted">{user.name}</Text>
          <Text>{user.score}</Text>
        </SimpleGrid>
      ))}
    </Stack>
  );
}
```

Inline does not mean literal. Values come from the design system's tokens (`gap="lg"`,
`color="muted"`), never raw pixels or hex codes. If the design system can't express something yet,
an inline `style` with token variables is fine. Add a comment that names the gap.

## Prefer inversion of control

When code has to handle a growing number of branches, **lift the branching to the caller** and let
the caller decide.

> "Make your abstraction do less stuff, and make your users do that instead." —
> [Kent C. Dodds](https://kentcdodds.com/blog/inversion-of-control)

**Why?**

- **Maintenance:** every option needs docs, support and tests, and options overlap over time.
- **Implementation:** it's never "just an if". Branches compound, and you end up supporting
  combinations nobody uses but you can't remove.
- **API:** every prop or argument makes the thing harder to learn, and that complexity leaks into
  the caller's code.

In JSX, invert control with `children`, element props (`actions={<Button />}`), compound components
(`<Card><CardHeader /></Card>`) and, rarely, render props.

Business logic:

```ts
// Avoid: the function knows about every app
async function setupGraphql(clientName: string, revertToDefaultRole: boolean) {
  const client = await apolloClient();
  const { token } = await firebaseIDToken();

  let role = revertToDefaultRole ? "authenticated" : undefined;
  if (clientName === "talent-hub") {
    if (token.has("client")) role = "client";
    if (token.has("recruiter")) role = "recruiter";
  }
  if (clientName === "candidate" && token.has("reader")) role = "reader";
  if (clientName === "growth") role = "student";

  client.setRoleInHeader(role);
}

// Prefer: each app decides its own role
async function setupGraphql(determineRole: (token: Token) => Role) {
  const client = await apolloClient();
  const { token } = await firebaseIDToken();
  client.setRoleInHeader(determineRole(token));
}

// talent-hub app
setupGraphql((token) => {
  if (token.has("recruiter")) return "recruiter";
  if (token.has("client")) return "client";
  return "authenticated";
});

// candidate app
setupGraphql((token) => (token.has("reader") ? "reader" : "authenticated"));
```

JSX:

```tsx
// Avoid: boolean flags that grow with every new page
function NavBar({ shouldShowLogin, shouldShowSignUp, isMobile }: NavBarProps) {
  return (
    <HStack as="nav" justify="between">
      <Logo />
      {shouldShowLogin && <Button>Log in</Button>}
      {shouldShowSignUp && (
        <HStack gap="sm">
          {isMobile && <Text>Want to join?</Text>}
          <Button>Sign up</Button>
        </HStack>
      )}
    </HStack>
  );
}

// Prefer: the page passes what goes on the right
function NavBar({ actions }: { actions: ReactNode }) {
  return (
    <HStack as="nav" justify="between">
      <Logo />
      {actions}
    </HStack>
  );
}

function LoginPage() {
  return <NavBar actions={<Button>Log in</Button>} />;
}
```

## Prefer to reduce nesting

Use early returns, `async`/`await` instead of promise chains, and drop `else` after a `return`.

```ts
// Avoid
function selectBorderColor(user?: User) {
  if (user) {
    if (user.score > 90) {
      return "danger";
    } else {
      return "success";
    }
  } else {
    return "muted";
  }
}

// Prefer
function selectBorderColor(user?: User) {
  if (!user) return "muted";
  if (user.score > 90) return "danger";
  return "success";
}
```

In JSX, return early for loading, empty and error states instead of nesting ternaries:

```tsx
if (isLoading) return <Spinner />;
if (users.length === 0) return <Text color="muted">No members yet.</Text>;
return <MemberTable users={users} />;
```

https://testing.googleblog.com/2017/06/code-health-reduce-nesting-reduce.html

## Prefer code colocation

Keep code as close as possible to where it's used: helpers, types, constants, styles, tests and
stories live next to the component that uses them, unless a convention says otherwise. Move
something to a shared place only when a second feature needs it.

https://kentcdodds.com/blog/colocation

## Must not mutate function arguments

Never mutate a function's arguments. Return a new value instead. Mutations at a distance cause bugs
that are hard to trace.

## Must not mutate arrays or objects you don't own

Create new ones instead: spread, `map`, `filter`, `toSorted()`, `toSpliced()`, `structuredClone()`.
In React this is also required for correctness: state updates must be new references.

```ts
// Avoid
users.sort(byScore);
settings.theme = "dark";

// Prefer
const ranked = users.toSorted(byScore);
const next = { ...settings, theme: "dark" };
```

## Prefer object parameters when there are more than 2

With more than two parameters, pass one object. Call sites become self-describing and order stops
mattering.

```ts
// Avoid
inviteMember("ada@example.com", "admin", true, 7);

// Prefer
inviteMember({ email: "ada@example.com", role: "admin", shouldNotify: true, expiresInDays: 7 });
```

## Prefer native language and platform features first

Reach for the language and the platform before a library: `Array` methods, `Intl` for dates and
numbers, `URL`, `structuredClone`, `fetch`. In the browser, use `<dialog>`, `<details>`, `<form>`,
native inputs and `popover` before JavaScript widgets.

```ts
// Avoid
import { map } from "ramda";
const summaries = map(toSummary, users);

// Prefer
const summaries = users.map(toSummary);
```

## Prefer sorted imports

Three groups, separated by a blank line:

1. Third-party packages
2. Outer modules (absolute)
3. Inner modules (relative)

## Must use absolute imports for outer modules

## Must use relative imports for inner modules

```tsx
// current file: web/src/dashboard/features/user/OrganizationUsers.tsx
import { useState } from "react";
import * as Sentry from "@sentry/react";

import { Stack, Text } from "@becket-ui/react";
import { formatDate } from "shared/dates"; // web/src/shared/dates

import { findTopScorer } from "./utils"; // same feature
import { UserSummary } from "./components";
```

# Naming

Names should be clear and precise: it should be easy to tell what a name refers to, and what it
doesn't.

https://testing.googleblog.com/2017/10/code-health-identifiernamingpostforworl.html

## Avoid implied keywords in function names

Don't start function names with `get`. Almost every function returns something, so `get` says
nothing. Name what the function **does**: `select`, `find`, `sort`, `merge`, `transform`,
`determine`, `search`, `filter`, `sum`, `format`, `to…`.

```ts
// Avoid
function getUsername(user: User) {
  return user.name;
}
function getUsersScoreTotal(users: User[]) {
  return users.reduce((sum, user) => sum + user.score, 0);
}

// Prefer
function selectUsername(user: User) {
  return user.name;
}
function sumScores(users: User[]) {
  return users.reduce((sum, user) => sum + user.score, 0);
}
```

Exceptions: getters required by a platform or library API (`getServerSideProps`,
`getBoundingClientRect`).

## Initialisms

Initialisms keep a consistent case: `URL` or `url`, never `Url`. Write `appID`, `userURL`,
`parseHTML`, `xmlHTTPRequest`. Generated code is exempt.

https://github.com/golang/go/wiki/CodeReviewComments#initialisms

## Avoid words that are obvious from the type

```ts
// Avoid
const nameString: string = "";
const holidayDateList: Date[] = [];

// Prefer
const name = "";
const holidays: Date[] = [];
```

## Avoid irrelevant details

```ts
// Avoid
const finalBattleMostDangerousBossMonster = …;

// Prefer, if nothing needs disambiguating
const boss = …;
```

## Avoid words that are clear from the surrounding context

```ts
// Avoid
class AnnualHolidaySale {
  annualSaleRebate = 0;
  promoteHolidaySale() {}
}

// Prefer
class AnnualHolidaySale {
  rebate = 0;
  promote() {}
}
```

## Avoid words that could apply to any identifier

Cut the usual suspects: _data, state, amount, number, value, manager, engine, object, entity,
instance, helper, util, broker, metadata, process, handle, context, info, item, stuff_.

## Prefer descriptive names

Descriptive, yet as short as possible. Scope sets the length: a two-line callback can use `user`; a
module-level export needs more.

## Name consistency

### Boolean

Use an auxiliary verb: `is`, `has`, `does`, `should`, `can`. For example `isOpen`, `hasError`,
`shouldNotify`. Boolean props follow the same rule unless the design system's API already names them
(`disabled`, `invalid`, `checked`).

### Union types and enums

Type names are UpperCamelCase and **singular**: `CandidateStage`, not `CandidateStages`. Prefer
string unions ([see TypeScript](#prefer-unions-and-as-const-over-enums)).

### Functions, variables, objects

camelCase. When a name needs more than four words, group the words with `_` so the parts stay
readable:

```ts
const storyForgotPasswordSuccessPageSuccess; // avoid
const story_forgotPasswordSuccessPage_success; // prefer
```

### Components and types

UpperCamelCase: `MemberTable`, `MemberTableProps`.

### Environment variables

UPPER_SNAKE_CASE. Only environment variables are upper case. Every other constant is a plain `const`
in camelCase, because everything is `const` by default.

### Folders

kebab-case, except component folders, which match the component name (`MemberTable/`).

### Files

Name a file after its main export: `MemberTable.tsx`, `sumScores.ts`. Colocated files share the base
name: `MemberTable.test.tsx`, `MemberTable.stories.tsx`.

# Commenting

## Comment why, not how

The code already says how and what. A comment is for what the code can't say: why this decision, why
not the obvious alternative, what constraint forced it.

```ts
// Avoid: restates the code
// loop over users and add scores
const total = users.reduce((sum, user) => sum + user.score, 0);

// Prefer: explains a decision the reader would otherwise question
// Scores are summed client-side because the API caps aggregates at 100 rows.
const total = users.reduce((sum, user) => sum + user.score, 0);
```

https://testing.googleblog.com/2017/07/code-health-to-comment-or-not-to-comment.html

## TODO comments must have a ticket number

```ts
// TODO (MAV-90): replace this wrapper with Container once it ships.
```

# React

## Prefer design-system components over raw elements

If the design system has a component for it, use the component, not a raw element with inline
styles: layout (`Stack`, `HStack`, `Flex`, `SimpleGrid`), text (`Heading`, `Text`), dividers
(`Separator`), controls (`Button`, `TextField`, `Select`, `Switch`). Raw elements are for semantics
the design system doesn't cover, such as `<form>`, `<nav>`, `<main>` and `<ul>`, and those usually
pass through a component's `as` prop.

## Prefer derived values over synced state

If a value can be computed from props or state, compute it during render. Don't copy it into state
and keep it in sync with an effect.

```tsx
// Avoid
const [activeCount, setActiveCount] = useState(0);
useEffect(() => {
  setActiveCount(members.filter((member) => member.isActive).length);
}, [members]);

// Prefer
const activeCount = members.filter((member) => member.isActive).length;
```

Keep one source of truth for each piece of state, as low in the tree as it can live and as high as
it must.

## Use effects only to sync with something outside React

Effects are for subscriptions, timers, the DOM, and network or storage sync. They aren't for
transforming data or responding to events: put event logic in the event handler. App-wide side
effects (theme on `<html>`, analytics) belong at the app root, not inside a screen.

https://react.dev/learn/you-might-not-need-an-effect

## Must use stable keys

Use a stable ID from the data, never the array index for lists that can reorder, filter or grow.

## Name props `onX` and handlers `handleX`

Props that accept callbacks are `onSelect` and `onOpenChange`. Functions that handle them inside the
component are `handleSelect`. Short inline arrows are fine and often clearer
([inline over abstraction](#prefer-inline-logic-and-styling-over-abstraction)).

## Prefer native, accessible elements

Use `<button>` for actions, `<a href>` for navigation and `<label>` for inputs, never a clickable
`div`. Every control has an accessible name: a visible label, or `aria-label` when the label is
visual only (an icon button, a switch inside a table row). Use ARIA only when native HTML can't
express it. Target: WCAG 2.2 AA.

# TypeScript

## Must not use `any`

Use `unknown` and narrow it, or write the real type. If a library forces `any`, contain it at the
boundary and [explain why](#must-explain-when-ignoring-a-lint-or-typescript-rule).

## Prefer unions and `as const` over enums

String unions and `as const` objects are plain JavaScript
([native first](#prefer-native-language-and-platform-features-first)): they tree-shake, need no
runtime and work with `switch` exhaustiveness checks.

```ts
// Avoid
enum Role {
  Owner,
  Admin,
  Member,
}

// Prefer
type Role = "owner" | "admin" | "member";

const ROLES = ["owner", "admin", "member"] as const;
type Role = (typeof ROLES)[number];
```

Model states that can't coexist as a discriminated union, not as several booleans:

```ts
type Invite =
  | { status: "pending"; sentAt: Date }
  | { status: "accepted"; acceptedAt: Date }
  | { status: "expired" };
```

## Prefer inference inside, explicit types at boundaries

Let TypeScript infer local variables and private helpers. Write the types of exported functions,
component props and public APIs explicitly; they're documentation. Use `import type` for type-only
imports. Avoid non-null `!` and `as` casts; when one is unavoidable, explain it.

## Must explain when ignoring a lint or TypeScript rule

Every `eslint-disable`, `@ts-expect-error` or `biome-ignore` has a comment saying why. Prefer
`@ts-expect-error` over `@ts-ignore`, so it fails once the error is gone.

```ts
// Avoid
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [hasValidationError]);

// Prefer
// `toast` is a stable design-system utility; re-running on it would duplicate toasts.
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [hasValidationError]);
```

# Testing

## Test behavior the way a user sees it

Test what the user can see and do, not implementation details. Query by role and accessible name
(`getByRole('button', { name: 'Invite' })`), interact with `user-event`, and assert on visible
results. A test that breaks after a refactor that changed nothing for the user is testing the wrong
thing. Run an automated accessibility check (axe) on every interactive component.
