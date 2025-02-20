/** @type {import('tailwindcss').Config} */

// @layer theme => Pour les variables

// @layer comonents => Pour les classes de composants

// layer utilities => Pour faire des classes ?

// @layer base =>

// @media, @custom-variant, @supports, @slot

// hover, focus, active, visited, focus-within, focus-visible

// first, last, odd, even

// before, after, content, placeholder, file, marker, selection

// first-line, first-letter

// backdrop for <dialog>

// nth, only-child, first-of-type, empty, first-child

// required, disabled, read-only, indeterminate, invalid, checked

// has-*, group-*, peer-*, not-*, nth-*, in-*

// not-focus, ...

// data-current, grid-template-columns

// @container for the parent and @ in front of md, lg, etc to style an element based on the width of a parent element

// dark, motion-reduce | motion-safe, contrast-more | contrast-safe, forced-colors | not-forced-colors, portrait | landscape, supports | not-supports, rtl | ltr

// print

// starting:open

// data attributes

// open for <details> and <dialog> also working with popover and popovertarget attributes

// inert

// * to style children elements and ** to style all descendants. Warning: children can't override their own styling

{/* <button
  style={{
    "--bg-color": buttonColor,
    "--bg-color-hover": buttonColorHover,
    "--text-color": textColor,      }}
    className="bg-(--bg-color) text-(--text-color) hover:bg-(--bg-color-hover) ..."
>
  {children}    
</button> */}

// !important (important or prefix in front of @import "tailwindcss")

// @theme {  --breakpoint-2xl: initial;} to reset breakpoint

// @theme {  --breakpoint-*: initial;  --breakpoint-tablet: 40rem;  --breakpoint-laptop: 64rem;  --breakpoint-desktop: 80rem;}

// @custom-variant dark (&:where(.dark, .dark *));

// @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

// @theme {  --color-mint-500: oklch(0.72 0.11 178);}

import { animation, brightness, colors, fontSize, keyframes, scale, screens, spacing, transitionDuration, transitionProperty, zIndex } from "./tailwind-extend";

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: animation,
      brightness: brightness,
      colors: colors,
      fontSize: fontSize,
      keyframes: keyframes,
      scale: scale,
      screens: screens,
      spacing: spacing,
      transitionDuration: transitionDuration,
      transitionProperty: transitionProperty,
      zIndex: zIndex
    },
  },
};
