// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const path = require("path");

module.exports = {
  plugins: [vue()],
  build: {
    // minify: false,
    lib: {
      entry: path.resolve(__dirname, "src/plugin.js"),
      name: "PanasonicGraph",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
};
