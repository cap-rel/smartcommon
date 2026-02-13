import { defineConfig } from "vite";
// import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'smartcommon',
      fileName: (format) => `smartcommon.${format}.js`,
      cssFileName: "smartcommon-style"
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-hot-toast'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-hot-toast': 'reactHotToast',
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
