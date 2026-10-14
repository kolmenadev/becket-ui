---
'@becket-ui/tokens': minor
'@becket-ui/react': minor
---

Every recipe length now comes from a Becket scale, checked by a new tokens test.

- `Avatar` sizes are Fibonacci steps: `sm` 20px, `md` 32px, `lg` 52px, and a new `xl` at 84px. Initials scale with the circle.
- `AspectRatio` takes a named ratio instead of a number: `'1:1'`, `'3:2'`, `'5:3'`, `'8:5'`, `'13:8'`, their portrait flips, and `'16:9'` / `'9:16'` for video.
- `Switch` height follows the type scale, and its track and thumb use Fibonacci proportions. `md` is slightly smaller and `lg` slightly larger.
- `Textarea` heights, `Menu` minimum width and `Tooltip` maximum width move to Fibonacci size steps.
- `Icon`, `Spinner`, `Checkbox`, `Radio` and `Select` use the type scale, at the same pixel sizes as before.
