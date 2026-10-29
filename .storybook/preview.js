import "../src/lib/assets/styles/export.css";
import "../src/storybook/assets/style.css";

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    options: {
      // The home page opens first (it is the landing page of the published
      // site), then the SmartMaker page, then the components.
      storySort: {
        order: ["Accueil", "SmartMaker", "Components"],
      },
    },
  },
};

export default preview;
