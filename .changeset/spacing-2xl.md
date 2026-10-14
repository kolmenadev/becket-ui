---
'@becket-ui/tokens': minor
'@becket-ui/react': minor
---

Rename the spacing token `2xs` to `2xl`.

`2xs` resolved to Fibonacci step 13 (3.25rem), larger than `xl`, so the name said the opposite of the value. It's now `2xl`, the step after `xl` (`xs` 0.25 → `sm` 0.5 → `md` 0.75 → `lg` 1.25 → `xl` 2 → `2xl` 3.25rem).

**Migration:** replace `gap="2xs"` with `gap="2xl"` (same 3.25rem), and `var(--beckui--spacing-2xs)` with `var(--beckui--spacing-2xl)`. TypeScript flags the old value. Numeric `gap={13}` is unchanged.
