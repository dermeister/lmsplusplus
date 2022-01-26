const portMappingsPromise = new Promise(resolve => {
    function onMessage(event) {
        const data = JSON.parse(event.data)
        resolve(new Map(data.map(d => [d.virtualPort, d.port])))
        removeEventListener("message", onMessage)
    }

    addEventListener("message", onMessage)
})

let virtualPort = null

addEventListener("fetch", event => {
    const { request } = event
    const url = new URL(request.url)
    const isRelativePath = url.host === location.host && url.port === location.port
    const isLocalhost = url.host === location.host
    if (isRelativePath || isLocalhost)
        event.respondWith(portMappingsPromise.then(async portMappings => {
            const newHost = "localhost"
            let newPort
            if (isRelativePath) {
                if (virtualPort === null) {
                    virtualPort = Number(url.searchParams.get("virtual-port"))
                    url.searchParams.delete("virtual-port")
                }
                newPort = portMappings.get(virtualPort)
            } else
                newPort = portMappings.get(url.port)
            const headers = new Headers(request.headers)
            headers.set("lmsplusplus-host", newHost)
            headers.set("lmsplusplus-port", newPort)
            let body = null
            if (request.method !== "GET" && request.method !== "OPTIONS")
                body = await request.arrayBuffer()
            const newUrl = `/api/proxy${url.pathname}?${url.searchParams.toString()}`
            const newRequest = new Request(newUrl, { headers, body })
            return await fetch(newRequest)
        }))
})
