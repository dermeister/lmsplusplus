import { defineConfig, ProxyOptions } from "vite"
import react from "@vitejs/plugin-react"
import { readFileSync } from "fs"
import { resolve } from "path"
import { ServerOptions } from "https"

const proxyOptions: ProxyOptions = {
    target: "http://localhost:5044",
    changeOrigin: true,
    ws: true
}

export default defineConfig({
    build: { target: "es2015" },
    esbuild: { target: "es2015" },
    css: { modules: { localsConvention: "camelCaseOnly" } },
    plugins: [react({ babel: { parserOpts: { plugins: ["decorators-legacy"] } } })],
    server: {
        https: getHTTPSConfiguration(),
        proxy: {
            "/users": proxyOptions,
            "/preferences": proxyOptions,
            "/permissions": proxyOptions,
            "/vcs-hosting-providers": proxyOptions,
            "/vcs-accounts": proxyOptions,
            "/technologies": proxyOptions,
            "/topics": proxyOptions,
            "/solutions": proxyOptions,
            "/tasks": proxyOptions,
            "/groups": proxyOptions,
            "/application": proxyOptions,
            "/proxy": proxyOptions
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
