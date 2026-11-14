import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx|ts|tsx)$/,
    }),
  ],

  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },

  server: {
    port: 5173,
    strictPort: true,
  },
});
