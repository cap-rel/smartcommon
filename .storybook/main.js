import process from "node:process";

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
    // Debug builds: `SB_NOMIN=1 storybook build` (or `make storybook-build-debug`)
    // disables minification and emits sourcemaps so runtime error overlays show
    // real component / function names instead of single-letter minified ones.
    // Makes bug reports from the hosted Storybook actionable.
    if (process.env.SB_NOMIN) {
      config.build = { ...(config.build || {}), minify: false, sourcemap: true };
    }
    return config;
  },
};

export default config;