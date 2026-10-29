import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// Brand the published site (smartmaker.org/components/): the name in the
// sidebar links back to the home page instead of showing the Storybook logo.
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "smartcommon",
    brandUrl: "./",
    brandTarget: "_self",
    colorSecondary: "#f72d40",
  }),
});
