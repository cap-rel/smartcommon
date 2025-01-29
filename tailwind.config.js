/** @type {import('tailwindcss').Config} */

import animation from './tailwind-extend/animation';
import brightness from './tailwind-extend/brightness';
import colors from './tailwind-extend/colors';
import fontSize from './tailwind-extend/fontSize';
import keyframes from './tailwind-extend/keyframes';
import scale from './tailwind-extend/scale';
import screens from './tailwind-extend/screens';
import spacing from './tailwind-extend/spacing';
import transitionDuration from './tailwind-extend/transitionDuration';
import transitionProperty from './tailwind-extend/transitionProperty';
import zIndex from './tailwind-extend/zIndex';

// const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [
    // require('@tailwindcss/forms'),
    // require('daisyui'),
  ],
  // daisyui: {
  //   themes: ["garden", "black"],
  //   darkTheme: "black",
  // },
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
