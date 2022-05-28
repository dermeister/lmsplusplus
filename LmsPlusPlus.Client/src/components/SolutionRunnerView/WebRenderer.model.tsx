import React from "react"
import { cached, Transaction, transaction, unobservable } from "reactronic"
import { IDisposable } from "../../IDisposable"
import { ObservableObject } from "../../ObservableObject"
import { IRenderer } from "./IRenderer"
import * as view from "./WebRenderer.view"

export class WebRenderer extends ObservableObject implements IRenderer, IDisposable {
    @unobservable private static readonly _iframeContainer = document.getElementById("webview") as HTMLDivElement
    @unobservable private readonly _virtualPort: number
    private _iframe: HTMLIFrameElement | null = null
    private _mountContainer: HTMLElement | null = null
    private _mountContainerResizeObserver: ResizeObserver | null = null
    private _isConnected = false
    private _iframeLeft = 0
    private _iframeTop = 0
    private _iframeWidth = 0
    private _iframeHeight = 0

    get title(): string { return `Port ${this._virtualPort}` }

    constructor(virtualPort: number) {
        super()
        this._virtualPort = virtualPort
    }

    override dispose(): void {
        Transaction.run(() => {
            this.unmount()
            if (WebRenderer._iframeContainer.contains(this._iframe))
                WebRenderer._iframeContainer.removeChild(this._iframe as HTMLIFrameElement)
            super.dispose()
        })
    }

    @cached
    render(): JSX.Element {
        return <view.WebRenderer model={this} isConnected={this._isConnected} />
    }

    @transaction
    mount(element: HTMLElement): void {
        this._mountContainer = element
        if (!this._iframe) {
            this._iframe = WebRenderer.createIframe(this._virtualPort)
            WebRenderer._iframeContainer.appendChild(this._iframe)
        }
        this._mountContainerResizeObserver = new ResizeObserver(entries => {
            Transaction.run(() => {
                if (entries[0].borderBoxSize[0].inlineSize !== 0) {
                    const element = entries[0].target as HTMLElement
                    if (this._iframeWidth + 1 !== element.clientWidth) {
                        this._iframeWidth = element.clientWidth - 1
                        this._iframe!.style.width = `${this._iframeWidth}px`
                    }
                    if (this._iframeHeight + 1 !== element.clientHeight) {
                        this._iframeHeight = element.clientHeight - 1
                        this._iframe!.style.height = `${this._iframeHeight}px`
                    }
                    if (this._iframeLeft !== element.offsetLeft) {
                        this._iframeLeft = element.offsetLeft
                        this._iframe!.style.left = `${this._iframeLeft}px`
                    }
                    if (this._iframeTop !== element.offsetTop) {
                        this._iframeTop = element.offsetTop
                        this._iframe!.style.top = `${this._iframeTop}px`
                    }
                    this._iframe!.style.zIndex = "100"
                }
            })
        })
        this._mountContainerResizeObserver.observe(element)
    }

    @transaction
    unmount(): void {
        if (this._mountContainer) {
            this._mountContainerResizeObserver?.unobserve(this._mountContainer)
            this._mountContainer = null
        }
        if (this._iframe)
            this._iframe.style.zIndex = "-1"
    }

    @transaction
    connectToBackend(): void {
        this._isConnected = true
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
