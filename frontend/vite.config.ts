import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Determina o target do proxy baseado no ambiente
  const apiTarget = process.env.DOCKER_ENV === 'true' 
    ? 'http://backend:3000'  // Docker: usa nome do serviço
    : 'http://localhost:3000'; // Local: usa localhost
  
  return {
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
