import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "./",
  lib: {
    entry: path.resolve(__dirname, 'src/index.js'), // Point d'entrée de la lib
    name: 'SmartCommon',  // Nom global de la bibliothèque
    fileName: (format) => `smart-common.${format}.js`,  // Format du fichier de sortie
  },
  rollupOptions: {
    external: ['react', 'react-dom'], // Assurez-vous que React et ReactDOM ne sont pas inclus dans le bundle
    output: {
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
      },
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "assets/*"],
      manifest: {
        name: "SmartMaker",
        short_name: "SmartMaker",
        description: "description",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "images/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "images/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
