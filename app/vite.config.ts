import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  envDir: "..",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4657",
        changeOrigin: false,
        secure: false,
      },
    },
  },
})
