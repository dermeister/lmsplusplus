import { Renderer } from "./Renderer"
import { reaction, Ref, Rx, Transaction } from "reactronic"
import { ObservableObject } from "../../../ObservableObject"

export class ServiceWebview extends ObservableObject implements Renderer {
    private readonly _iframe = document.createElement("iframe")
    private readonly _virtualPort: number
    private readonly _isBackendLoading: Ref<boolean>
    private _mountContainer: HTMLElement | null = null

    constructor(virtualPort: number, isBackendLoading: Ref<boolean>) {
        super()
        this._virtualPort = virtualPort
        this._isBackendLoading = isBackendLoading
        this._iframe.src = "backend-is-loading.html"
        this._iframe.style.width = "100%"
        this._iframe.style.height = "100%"
        this._iframe.style.border = "none"
        this._iframe.style.backgroundColor = "white"
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

    override dispose(): void {
        Transaction.run(() => {
            if (this._mountContainer?.contains(this._iframe))
                this._mountContainer?.removeChild(this._iframe)
            Rx.dispose(this._isBackendLoading)
            super.dispose()
        })
    }

    @reaction
    private connectIframeToBackend(): void {
        if (!this._isBackendLoading.value)
            this._iframe.src = `/?virtual-port=${this._virtualPort}`
    }
}
