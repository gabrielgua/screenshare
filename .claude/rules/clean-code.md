# Clean Code Rules

These rules are mandatory for every file in this project. They exist so the code explains itself
without any extra documentation.

## 1. Never write comments in code

- No `//`, `/* */`, `<!-- -->` or JSDoc comments in `.ts`, `.vue`, `.css` or config files.
- If a piece of code feels like it needs a comment, rename things or extract a well-named function,
  constant or component until the comment becomes unnecessary.
- Explanations, decisions and research belong in Markdown files (`CLAUDE.md`, `docs/`), commit
  messages and pull request descriptions. Never in the code.

## 2. Names explain intent

- Variables, functions, constants, files, props, events, CSS tokens and types use full, descriptive
  words. No abbreviations: `isMicrophoneMuted`, not `mut`; `selectedScreenSource`, not `src`.
- Booleans read as yes/no questions: `isLoading`, `hasError`, `canShareScreen`, `shouldAutoplay`.
- Functions start with a verb: `startScreenShare`, `toggleColorScheme`, `formatParticipantName`.
- Event handlers are named after the user action: `handleShareButtonClick`, `handleSignInSubmit`.
- Constants that never change at runtime use `SCREAMING_SNAKE_CASE`:
  `MAXIMUM_STREAM_FRAME_RATE`, `DEFAULT_BUTTON_SIZE`.
- Collections are plural: `participants`, `availableScreenSources`.
- Maps from one thing to another are named `<value>By<key>`: `buttonClassesByVariant`,
  `iconPixelSizeBySize`.
- Avoid generic names: `data`, `info`, `item`, `temp`, `value`, `helper`, `utils`, `manager`.

## 3. Componentize everything

- Every visual piece that has a name in the product (a button, a participant tile, a stream
  control bar) is its own component.
- **The rule of two:** the moment something is used twice, promote it to a component, composable
  or constant. Do not wait for a third copy.
- Components stay small and focused on one job. If a template needs scrolling to read, split it.
- Components live in `web/src/components/<group>/`, one folder per group (`button/`, `form/`,
  `typography/`). There is no `base/` folder. Design system building blocks are prefixed with
  `Base` (`BaseButton`, `BaseInput`). Feature components live in a folder named after the feature.
- Views in `web/src/views/` only compose components. They hold no styling decisions of their own.

## 4. Use the design system, never raw styling

- Colors, typography, radii and shadows come from the theme tokens in `web/src/theme/theme.css`.
  Never hardcode hex colors or arbitrary Tailwind values like `text-[#5865F2]` in components.
- Text is rendered with `BaseHeading` and `BaseText`, never a raw `<h1>` or `<p>` with ad-hoc
  classes.
- Clickable actions use `BaseButton` or `BaseIconButton`. Form fields use `BaseInput` or
  `BaseTextarea`. Icons use `BaseIcon` with names from `web/src/theme/app-icons.ts`.
- Every component supports dark mode through Tailwind `dark:` variants. Dark mode is driven by the
  `dark` class that `useDark` from VueUse adds to `<html>`.
- Every layout is mobile first: start with the phone layout, then add `sm:`, `md:`, `lg:`
  variants. Touch targets are at least 40px tall on phones.

## 5. Variants are typed, finite and mapped

### Variant types are plain unions

- Every variation (`size`, `variant`, `appearance`, `type`, ...) is a plain string union type,
  written directly. Never derive a type from an `as const` array.

  ```ts
  export type ButtonType = 'button' | 'submit' | 'reset'
  ```

  Never:

  ```ts
  export const BUTTON_TYPES = ['button', 'submit', 'reset'] as const
  export type ButtonType = (typeof BUTTON_TYPES)[number]
  ```

- A type that only one component owns is exported from **inside that component's
  `<script setup lang="ts">`**. Other files import it with
  `import BaseButton, { type ButtonType } from './BaseButton.vue'`.
- Types shared by several unrelated components live in `web/src/theme/` (`ColorVariant`,
  `ControlSize`, `TextTone`, ...).
- Defaults are written as literals in `withDefaults` (`size: 'md'`). There are no `DEFAULT_*`
  constants for variants.
- When code needs to loop over the values of a union, it declares a typed array:
  `const AVAILABLE_CONTROL_SIZES: ControlSize[] = ['sm', 'md', 'lg']`.

### One script block per component

- Every component has exactly **one** `<script setup lang="ts">` block. Never add a second plain
  `<script lang="ts">` block.
- Vue only lets `<script setup>` export types, not values. So a component never exports class maps
  or constants. When two components need the same classes, one renders the other
  (`BaseIconButton` renders `BaseButton`, `BaseHeading` renders `BaseText`).

### Classes live in the component

- **A component's Tailwind classes live inside its own `.vue` file.** Never move them into a
  separate `*-classes.ts` file. Opening `BaseButton.vue` must show every class a button can have.
- Classes every variation shares go **directly on the element's static `class` attribute** in the
  template. Do not store them in a constant like `SHARED_BUTTON_CLASSES`.
- Classes that change go in `:class`, using `Record<Variant, string>` maps named
  `<thing>ClassesBy<Variant>`, plus object syntax for booleans (`{ 'w-full': isFullWidth }`).
- **Never repeat a class across every entry of a map.** If every entry has `border`, put `border`
  on the element and keep only the varying part (`border-transparent`, `border-brand-600`) in the
  map. If one part varies by a single dimension, give it its own map: the focus outline varies only
  by variant, so it lives in `focusOutlineClassesByVariant` instead of being repeated per
  appearance.
- Use complete literal class names so Tailwind can detect them. Never build class names with
  string interpolation like `` `bg-${color}-500` ``.
- Never put two utilities for the same property where both can apply, like `bg-white` on the tag
  and `bg-neutral-100` in a disabled class. Give each state its own branch.

## 6. TypeScript and Vue conventions

- Exactly one `<script setup lang="ts">` in every component. Props use `defineProps` with a typed
  interface and `withDefaults`. Two-way bindings use `defineModel`.
- Shared reactive logic goes into composables named `use<Something>` in `web/src/composables/`,
  in kebab-case files: `use-color-scheme.ts`.
- Stores live in `web/src/stores/` as `<domain>-store.ts` and export `use<Domain>Store`.
- No `any`. Prefer narrow union types over `string`.
- Formatting follows `.prettierrc.json` (no semicolons, single quotes, 100 columns).
