import { ITheme, Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { Renderer } from "./Renderer"

export class ConsoleRenderer implements Renderer {
    private readonly _terminal: Terminal
    private readonly _fitAddon = new FitAddon()
    private readonly _terminalContainer = document.createElement("div")
    private readonly _resizeObserver = new ResizeObserver(() => this.resizeTerminalContainer())
    private _mountContainer: HTMLElement | null = null

    private static get terminalTheme(): ITheme {
        const style = getComputedStyle(document.documentElement)
        return {
            background: style.getPropertyValue("--background-primary"),
            foreground: style.getPropertyValue("--text-primary")
        }
    }

    constructor() {
        this._terminal = new Terminal({ theme: ConsoleRenderer.terminalTheme })
        this._terminal.loadAddon(this._fitAddon)
        this.styleTerminalContainer()
    }

    show(element: HTMLElement): void {
        this._resizeObserver.observe(this._terminalContainer)
        this._mountContainer = element
        element.appendChild(this._terminalContainer)
        if (!this._terminal.element) {
            this._terminal.open(this._terminalContainer)
            this.styleTerminalElement()
        }
    }

    hide(): void {
        this._mountContainer?.removeChild(this._terminalContainer)
        this._mountContainer = null
        this._resizeObserver.unobserve(this._terminalContainer)
    }

    write(text: string): void {
        this._terminal.write(text)
    }

    dispose(): void {
        if (this._mountContainer?.contains(this._terminalContainer))
            this._mountContainer?.removeChild(this._terminalContainer)
        this._terminal.dispose()
        this._fitAddon.dispose()
        this._resizeObserver.disconnect()
    }

    private resizeTerminalContainer(): void {
        setTimeout(() => {
            if (this._terminalContainer.isConnected)
                this._fitAddon.fit()
        }, 0)
    }

    private styleTerminalContainer(): void {
        this._terminalContainer.style.width = "100%"
        this._terminalContainer.style.height = "100%"
        this._terminalContainer.style.backgroundColor = ConsoleRenderer.terminalTheme.background ?? "black"
    }

    private styleTerminalElement(): void {
        const terminalElement = this._terminalContainer.querySelector(".terminal")
        if (terminalElement instanceof HTMLElement)
            terminalElement.style.padding = "14px"
    }
}
