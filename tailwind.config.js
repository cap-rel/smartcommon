/** @type {import('tailwindcss').Config} */

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
