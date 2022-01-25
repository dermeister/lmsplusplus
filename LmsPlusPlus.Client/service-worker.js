const portMappingsPromise = new Promise(resolve => {
    function onMessage(event) {
        const data = JSON.parse(event.data)
        resolve(new Map(data.map(d => [d.virtualPort, d.port])))
        removeEventListener("message", onMessage)
    }

    addEventListener("message", onMessage)
})

addEventListener("fetch", event => {
    event.respondWith(portMappingsPromise.then(portMappings => {
        const url = new URL(event.request.url)
        const virtualPort = Number(url.searchParams.get("virtual-port"))
        const port = portMappings.get(virtualPort)
        return fetch(`http://localhost:${port}`).catch(async () => {
            await new Promise(r => setTimeout(r, 200))
            return fetch(`http://localhost:${port}`)
        })
    }))
})
