import { Renderer } from "./Renderer"

export class WebRenderer implements Renderer {
    private readonly iframe = document.createElement("iframe")
    private mountElement: HTMLElement | null = null

    constructor() {
        this.iframe.src = "index.html"
        this.iframe.style.width = "100%"
        this.iframe.style.height = "100%"
        this.iframe.style.border = "none"
    }

    show(element: HTMLElement): void {
        if (!this.mountElement) {
            this.mountElement = element
            this.mountElement.appendChild(this.iframe)
        }
        this.iframe.style.position = "static"
        this.iframe.style.left = "auto"
    }

    hide(): void {
        this.iframe.style.position = "absolute"
        this.iframe.style.left = "-100vw"
    }

    dispose(): void {
        if (this.mountElement?.contains(this.iframe))
            this.mountElement?.removeChild(this.iframe)
    }
}
