/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: [
    // "../src/**/*.mdx",
    "../src/storybook/pages/**/*.mdx",
    "../src/storybook/stories/**/.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {
    defaultName: "Documentation",
    docsMode: false,
  }
};

export default config;