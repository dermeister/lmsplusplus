import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"
import { readFileSync } from "fs"
import { resolve } from "path"
import { ServerOptions } from "https"

export default defineConfig({
    build: { target: "es2015" },
    esbuild: { target: "es2015" },
    css: { modules: { localsConvention: "camelCaseOnly" } },
    plugins: [reactRefresh()],
    server: {
        https: getHTTPSConfiguration(),
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

function getHTTPSConfiguration(): ServerOptions {
    const home = process.env.HOME ?? process.env.USERPROFILE
    if (!home)
        throw new Error("Cannot determine HTTPS certificate location")
    return {
        pfx: readFileSync(resolve(home, ".aspnet/https/certificate.pfx")),
        passphrase: "development"
    }
}
