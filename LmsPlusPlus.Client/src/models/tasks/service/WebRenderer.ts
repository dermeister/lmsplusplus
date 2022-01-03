import { Renderer } from "./Renderer"

export class WebRenderer implements Renderer {
    private readonly _iframe = document.createElement("iframe")
    private _mountElement: HTMLElement | null = null

    constructor(port: number) {
        this._iframe.src = "index.html"
        this._iframe.style.width = "100%"
        this._iframe.style.height = "100%"
        this._iframe.style.border = "none"
    }

    show(element: HTMLElement): void {
        if (!this._mountElement) {
            this._mountElement = element
            this._mountElement.appendChild(this._iframe)
        }
        this._iframe.style.position = "static"
        this._iframe.style.left = "auto"
    }

    hide(): void {
        this._iframe.style.position = "absolute"
        this._iframe.style.left = "-100vw"
    }

    dispose(): void {
        if (this._mountElement?.contains(this._iframe))
            this._mountElement?.removeChild(this._iframe)
    }
}
