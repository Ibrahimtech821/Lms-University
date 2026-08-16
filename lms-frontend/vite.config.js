import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import crypto from "crypto";

// New ID every time the Vite dev server starts
const devServerId = crypto.randomUUID();

export default defineConfig({
  plugins: [react(), tailwindcss()],

  define: {
    __DEV_SERVER_ID__: JSON.stringify(devServerId),
  },
});