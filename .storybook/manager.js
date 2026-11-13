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

// Home / End in the sidebar search field move the caret, as in any text
// field. The search box is a Downshift combobox: while its result list is
// open it cancels these keys to highlight the first / last result, so the
// caret could not reach the start or end of the query. Stopping the two keys
// in the capture phase, before React's root listener, leaves the browser
// default (caret move, Shift selection) and the arrow keys to Downshift.
if (typeof document !== "undefined") {
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        (event.key === "Home" || event.key === "End") &&
        event.target instanceof HTMLInputElement &&
        event.target.id === "storybook-explorer-searchfield"
      ) {
        event.stopPropagation();
      }
    },
    true,
  );
}
