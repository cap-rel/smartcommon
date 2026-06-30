import { defineConfig } from "vite";
// import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import process from "node:process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MINIFY=false npm run build -> readable output + sourcemap for easy debugging
// Default (no env var) -> minified production build + sourcemap
const shouldMinify = process.env.MINIFY !== "false";

export default defineConfig({
  base: "./",
  build: {
    sourcemap: true,
    minify: shouldMinify,
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'smartcommon',
      fileName: (format) => `smartcommon.${format}.js`,
      cssFileName: "smartcommon-style"
    },
    rollupOptions: {
      // Every runtime peerDependency MUST stay external. Otherwise the
      // published bundle ships its own copy, the consumer has another copy
      // in its node_modules, and any peer that exposes a React Context (or
      // a stateful singleton like a redux store, an i18next instance, a
      // Dexie database) ends up with two non-interoperable instances. This
      // is the root cause that broke <RouteGuard><Outlet /></RouteGuard>
      // when capTodo nested its own <BrowserRouter>: two RouteContext
      // objects, smartcommon read its own (empty) one. The bundleExternals
      // test (src/lib/tests/bundleExternals.test.js) enforces this list.
      external: [
        'react',
        'react-dom',
        'react-hot-toast',
        'react-i18next',
        // i18next is a stateful singleton shared with react-i18next: it MUST
        // stay external or a consumer ends up with two i18n instances. Same for
        // its http backend. Preventive: not imported by smartcommon today, but
        // this guards against a future `from "i18next"` being inlined.
        'i18next',
        'i18next-http-backend',
        'react-redux',
        '@reduxjs/toolkit',
        'dexie',
        'tailwind-merge',
        // react-router-dom re-exports everything from react-router; both
        // packages share the same RouteContext, so both must stay external.
        // The regex also catches subpaths like "react-router/dom".
        /^react-router(-dom)?($|\/)/,
        // leaflet is a regular dependency (auto-installed for consumers), but
        // it must stay external: the <Map> component lazy-imports it, so
        // keeping it external means it is never inlined into the library bundle
        // and only ends up in a consumer's build (as a lazy chunk) when <Map>
        // is actually used.
        'leaflet',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-hot-toast': 'reactHotToast',
          'react-i18next': 'reactI18next',
          'i18next': 'i18next',
          'react-redux': 'reactRedux',
          '@reduxjs/toolkit': 'reduxToolkit',
          'dexie': 'Dexie',
          'tailwind-merge': 'tailwindMerge',
          'react-router': 'ReactRouter',
          'react-router-dom': 'ReactRouterDOM',
        },
      },
    },
  },
  resolve: {
    alias: {
      'dev': path.resolve(__dirname, './src/dev'),
      'lib': path.resolve(__dirname, './src/lib'),
      // 'storybook': path.resolve(__dirname, './src/storybook'),
      'prop-types': 'prop-types/prop-types.js',
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    //     cleanupOutdatedCaches: true,
    //     skipWaiting: true,
    //   },
    //   injectRegister: "auto",
    //   includeAssets: ["favicon.ico", "assets/*"],
    //   manifest: {
    //     name: "SmartMaker",
    //     short_name: "SmartMaker",
    //     description: "description",
    //     start_url: "/",
    //     display: "standalone",
    //     background_color: "#ffffff",
    //     theme_color: "#000000",
    //     icons: [
    //       {
    //         src: "images/pwa-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "images/pwa-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //     ],
    //   },
    // }),
  ],
});
