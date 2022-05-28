import React from "react"
import { Ref, Rx } from "reactronic"
import { IDisposable } from "../../IDisposable"
import { IRenderer } from "./IRenderer"
import * as view from "./WebRenderer.view"

export class WebRenderer implements IRenderer, IDisposable {
    private static readonly _iframeContainer = document.getElementById("webview") as HTMLDivElement
    private readonly _isBackendLoading: Ref<boolean>
    private readonly _virtualPort: number
    private _iframe: HTMLIFrameElement | null = null
    private _mountContainer: HTMLElement | null = null
    private _mountContainerResizeObserver: ResizeObserver | null = null

    get title(): string { return `Port ${this._virtualPort}` }
    get isBackendLoading(): boolean { return this._isBackendLoading.value }
    get virtualPort(): number { return this._virtualPort }

    constructor(virtualPort: number, isBackendLoading: Ref<boolean>) {
        this._virtualPort = virtualPort
        this._isBackendLoading = isBackendLoading
    }

    dispose(): void {
        this.unmount()
        if (WebRenderer._iframeContainer.contains(this._iframe))
            WebRenderer._iframeContainer.removeChild(this._iframe as HTMLIFrameElement)
        Rx.dispose(this._isBackendLoading)
    }

    render(): JSX.Element {
        return <view.WebRenderer model={this} />
    }

    mount(element: HTMLElement): void {
        this._mountContainer = element
        if (!this._iframe) {
            this._iframe = WebRenderer.createIframe(this._virtualPort)
            WebRenderer._iframeContainer.appendChild(this._iframe)
        }
        this._mountContainerResizeObserver = new ResizeObserver(entries => {
            const element = entries[0].target as HTMLElement
            this._iframe!.style.width = `${element.clientWidth}px`
            this._iframe!.style.height = `${element.clientHeight}px`
            this._iframe!.style.left = `${element.offsetLeft}px`
            this._iframe!.style.top = `${element.offsetTop}px`
            this._iframe!.style.zIndex = "100"
        })
        this._mountContainerResizeObserver.observe(element)
    }

    unmount(): void {
        if (this._mountContainer) {
            this._mountContainerResizeObserver?.unobserve(this._mountContainer)
            this._mountContainer = null
        }
        if (this._iframe) {
            this._iframe.style.width = "0"
            this._iframe.style.height = "0"
            this._iframe.style.left = "0"
            this._iframe.style.bottom = "0"
            this._iframe.style.zIndex = "-1"
        }
    }

    private static createIframe(virtualPort: number): HTMLIFrameElement {
        const iframe = document.createElement("iframe")
        iframe.src = `/?lmsplusplus-virtual-port=${virtualPort}`
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
}
