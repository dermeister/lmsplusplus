import { ITheme, Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { Renderer } from "./Renderer"
import { ServiceBuildOutput } from "./ServiceBuildOutput"

const RESET_CURSOR_AND_CLEAR_SCREEN = "\u001b[H\u001b[0J"
const DELETE_LINE = "\u001b[K"

interface Line {
    text: string;
    anchor: string | null;
}

export class ServiceConsole implements Renderer {
    private readonly _terminal: Terminal
    private readonly _fitAddon = new FitAddon()
    private readonly _terminalContainer = document.createElement("div")
    private readonly _resizeObserver = new ResizeObserver(() => this.resizeTerminalContainer())
    private _mountContainer: HTMLElement | null = null
    private readonly _lines: Line[] = []

    private static get terminalTheme(): ITheme {
        const style = getComputedStyle(document.documentElement)
        return {
            background: style.getPropertyValue("--background-primary"),
            foreground: style.getPropertyValue("--text-primary")
        }
    }

    constructor() {
        this._terminal = new Terminal({ theme: ServiceConsole.terminalTheme, disableStdin: true, convertEol: true })
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

    writeBuildOutput(output: ServiceBuildOutput): void {
        if (output.anchor) {
            const line = this._lines.find(l => l.anchor === output.anchor)
            if (line)
                line.text = `${DELETE_LINE}${output.text}`
            else
                this._lines.push({ text: output.text, anchor: output.anchor })
        } else
            this._lines.push({ text: output.text, anchor: null })
        this._terminal.write(RESET_CURSOR_AND_CLEAR_SCREEN)
        this._lines.forEach(l => this._terminal.write(l.text))
    }

    enableStdin(onInput: (input: string) => void): void {
        this._terminal.setOption("disableStdin", false)
        this._terminal.onData(onInput)
    }

    writeServiceOutput(text: string): void {
        this._terminal.setOption("convertEol", false)
        this._terminal.write(text)
    }

    clear(): void {
        this._lines.splice(0, this._lines.length)
        this._terminal.write(RESET_CURSOR_AND_CLEAR_SCREEN)
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
        this._terminalContainer.style.backgroundColor = ServiceConsole.terminalTheme.background ?? "black"
    }

    private styleTerminalElement(): void {
        const terminalElement = this._terminalContainer.querySelector(".terminal")
        if (terminalElement instanceof HTMLElement)
            terminalElement.style.padding = "14px"
    }
}
