/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: [
    // "../src/**/*.mdx",
    "../src/storybook/pages/**/*.mdx",
    "../src/lib/components/**/*.mdx",
    "../src/lib/components/**/.stories.@(js|jsx|ts|tsx|mdx)"
    // "../src/storybook/stories/**/.stories.@(js|jsx|ts|tsx|mdx)"
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
  },
  // html5-qrcode is dynamically imported by BarcodeScanner. Force Vite to
  // pre-bundle it so Rollup can resolve the dynamic import at build time.
  viteFinal: async (config) => {
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      "html5-qrcode",
    ];
    return config;
  },
};

export default config;