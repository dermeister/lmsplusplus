import { Renderer } from "./Renderer"
import { reaction, Ref, Rx, Transaction } from "reactronic"
import { ObservableObject } from "../../../ObservableObject"

export class ServiceWebview extends ObservableObject implements Renderer {
    private static readonly _iframeContainer = document.getElementById("webview") as HTMLDivElement
    private readonly _iframe: HTMLIFrameElement
    private readonly _virtualPort: number
    private readonly _isBackendLoading: Ref<boolean>
    private _mountContainer: HTMLElement | null = null
    private _mountContainerResizeObserver: ResizeObserver | null = null

    constructor(virtualPort: number, isBackendLoading: Ref<boolean>) {
        super()
        this._virtualPort = virtualPort
        this._isBackendLoading = isBackendLoading
        this._iframe = ServiceWebview.createIframe()
        ServiceWebview._iframeContainer.appendChild(this._iframe)
    }

    override dispose(): void {
        Transaction.run(() => {
            this.unmount()
            if (ServiceWebview._iframeContainer.contains(this._iframe))
                ServiceWebview._iframeContainer.removeChild(this._iframe)
            Rx.dispose(this._isBackendLoading)
            super.dispose()
        })
    }

    mount(element: HTMLElement): void {
        if (!this._mountContainer) {
            this._mountContainer = element
            this._mountContainerResizeObserver = new ResizeObserver(entries => {
                const element = entries[0].target as HTMLElement
                this._iframe.style.width = `${element.clientWidth}px`
                this._iframe.style.height = `${element.clientHeight}px`
                this._iframe.style.left = `${element.offsetLeft}px`
                this._iframe.style.top = `${element.offsetTop}px`
                this._iframe.style.zIndex = "100"
            })
            this._mountContainerResizeObserver.observe(this._mountContainer)
        }
    }

    unmount(): void {
        if (this._mountContainer) {
            this._mountContainerResizeObserver?.unobserve(this._mountContainer)
            this._mountContainer = null
        }
        this._iframe.style.width = "0"
        this._iframe.style.height = "0"
        this._iframe.style.left = "0"
        this._iframe.style.bottom = "0"
        this._iframe.style.zIndex = "-1"
    }

    private static createIframe(): HTMLIFrameElement {
        const iframe = document.createElement("iframe")
        iframe.src = "backend-is-loading.html"
        iframe.style.position = "absolute"
        iframe.style.left = "0"
        iframe.style.bottom = "0"
        iframe.style.width = "0"
        iframe.style.height = "0"
        iframe.style.zIndex = "-1"
        iframe.style.border = "none"
        iframe.style.display = "block"
        iframe.style.backgroundColor = "white"
        return iframe
    }

    @reaction
    private connectIframeToBackend(): void {
        if (!this._isBackendLoading.value)
            this._iframe.src = `/?lmsplusplus-virtual-port=${this._virtualPort}`
    }
}
