import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"

export default defineConfig({
    build: { target: "es2015" },
    esbuild: { target: "es2015" },
    css: { modules: { localsConvention: "camelCaseOnly" } },
    plugins: [reactRefresh()],
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:5044",
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace(/^\/api/, "")
            }
        }
    }
})
