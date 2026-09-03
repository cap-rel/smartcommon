// Library build entry: ship the lib stylesheet, the same one the dev app
// (src/dev/main.jsx) and Storybook (.storybook/preview.js) already import.
// Pulling the dev copy here shipped a stale theme to consumers: its dark
// palette equalled the light one (--color-dark-soft-bg: white,
// --color-dark-strong-text: gray-900), so `.dark` was a no-op on every token,
// and it lacked the `@custom-variant dark` declaration, which compiled every
// `dark:` utility under @media (prefers-color-scheme: dark) instead of the
// `.dark` class ThemeApplier toggles.
import "lib/assets/styles/export.css";

export * from "lib/export";