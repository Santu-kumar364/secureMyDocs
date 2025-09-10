import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("@mui")) {
              return "vendor-mui";
            }
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("lucide-react") || id.includes("@emotion")) {
              return "vendor-ui";
            }
            return "vendor"; // other dependencies
          }
        },
      },
    },
    chunkSizeWarningLimit: 800, // Increase warning limit
  },
});