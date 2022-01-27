declare const self: ServiceWorkerGlobalScope

interface PortMapping {
    virtualPort: number;
    port: number;
}

const portMappingsPromise = new Promise<Map<number, number>>(resolve => {
    function onMessage(event: ExtendableMessageEvent) {
        const data = JSON.parse(event.data) as readonly PortMapping[]
        resolve(new Map(data.map(d => [Number(d.virtualPort), Number(d.port)])))
        self.removeEventListener("message", onMessage)
    }

    self.addEventListener("message", onMessage)
})

let virtualPort: number | null = null

self.addEventListener("fetch", event => {
    const { request } = event
    const url = new URL(request.url)
    const isRelativePath = url.host === location.host && url.port === location.port
    const isLocalhost = url.host === "localhost"
    if (isRelativePath || isLocalhost)
        event.respondWith(portMappingsPromise.then(async portMappings => {
            const newHost = "localhost"
            let newPort: number
            if (isRelativePath) {
                if (virtualPort === null) {
                    virtualPort = Number(url.searchParams.get("virtual-port"))
                    url.searchParams.delete("virtual-port")
                }
                newPort = portMappings.get(virtualPort) as number
            } else
                newPort = portMappings.get(Number(url.port)) as number
            const headers = new Headers(request.headers)
            headers.set("lmsplusplus-host", newHost)
            headers.set("lmsplusplus-port", newPort.toString())
            let body: ArrayBuffer | null = null
            if (request.method !== "GET" && request.method !== "OPTIONS")
                body = await request.arrayBuffer()
            const newUrl = `/api/proxy${url.pathname}?${url.searchParams.toString()}`
            const newRequest = new Request(newUrl, { headers, body })
            return await fetch(newRequest)
        }))
})

export {}
