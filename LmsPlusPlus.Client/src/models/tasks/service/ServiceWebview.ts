import { Renderer } from "./Renderer"
import { Disposable } from "../../../Disposable"

export class ServiceWebview implements Renderer, Disposable {
    private readonly _iframe = document.createElement("iframe")
    private _mountContainer: HTMLElement | null = null

    constructor() {
        this._iframe.src = "http://localhost"
        this._iframe.style.width = "100%"
        this._iframe.style.height = "100%"
        this._iframe.style.border = "none"
    }

    mount(element: HTMLElement): void {
        if (!this._mountContainer) {
            this._mountContainer = element
            this._mountContainer.appendChild(this._iframe)
        }
    }

    unmount(): void {
        if (this._mountContainer?.contains(this._iframe)) {
            this._mountContainer?.removeChild(this._iframe)
            this._mountContainer = null
        }
    }

    dispose(): void {
        if (this._mountContainer?.contains(this._iframe))
            this._mountContainer?.removeChild(this._iframe)
    }
}
