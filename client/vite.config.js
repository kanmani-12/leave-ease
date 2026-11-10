// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/leave-ease/",
  server: {
    proxy: {
      "/api": "https://leave-ease-27ij.onrender.com",
    },
  },
});
