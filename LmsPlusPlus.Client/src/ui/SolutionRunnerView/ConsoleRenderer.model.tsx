import React from "react"
import { cached, isnonreactive, reaction, Transaction, transaction } from "reactronic"
import { ITheme, Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { IDisposable } from "../../IDisposable"
import { ObservableObject } from "../../ObservableObject"
import { IThemeService } from "../ThemeService"
import * as view from "./ConsoleRenderer.view"
import { IRenderer } from "./IRenderer"

export interface ServiceBuildOutput {
    text: string
    anchor: string | null
}

export class ConsoleRenderer extends ObservableObject implements IRenderer, IDisposable {
    @isnonreactive private readonly _terminal: Terminal
    @isnonreactive private readonly _fitAddon = new FitAddon()
    @isnonreactive private readonly _terminalContainer = document.createElement("div")
    @isnonreactive private readonly _resizeObserver = new ResizeObserver(() => this.resizeTerminalContainer())
    @isnonreactive private readonly _anchoredLineOffsets = new Map<string, number>()
    @isnonreactive private readonly _themeService: IThemeService
    private _mountContainer: HTMLElement | null = null

    get title(): string { return "Console" }
    private static get terminalTheme(): ITheme {
        const style = getComputedStyle(document.documentElement)
        return {
            background: style.getPropertyValue("--background-primary").trim(),
            foreground: style.getPropertyValue("--text-primary").trim()
        }
    }

    constructor(themeService: IThemeService) {
        super()
        this._themeService = themeService
        this._terminal = new Terminal({
            theme: ConsoleRenderer.terminalTheme,
            disableStdin: true,
            convertEol: true,
            fontSize: 14
        })
        this._terminal.setOption("theme", ConsoleRenderer.terminalTheme)
        this._terminal.loadAddon(this._fitAddon)
        this.styleTerminalContainer()
    }

    @cached
    render(): JSX.Element {
        return <view.ConsoleRenderer model={this} />
    }

    @transaction
    mount(element: HTMLElement): void {
        this._resizeObserver.observe(this._terminalContainer)
        this._mountContainer = element
        element.appendChild(this._terminalContainer)
        if (!this._terminal.element) {
            this._terminal.open(this._terminalContainer)
            this.styleTerminalElement()
        }
    }

    @transaction
    unmount(): void {
        if (this._mountContainer?.contains(this._terminalContainer)) {
            this._mountContainer?.removeChild(this._terminalContainer)
            this._mountContainer = null
        }
        this._resizeObserver.unobserve(this._terminalContainer)
    }

    @transaction
    writeBuildOutput({ anchor, text }: ServiceBuildOutput): void {
        if (anchor) {
            if (!this._anchoredLineOffsets.has(anchor)) {
                /*
                   Offsets start from zero and each new offset is calculated as
                   previous offset incremented by one, which is equal to current
                   size of _anchoredLineOffsets
                */
                const offset = this._anchoredLineOffsets.size
                this._anchoredLineOffsets.set(anchor, offset)
                this._terminal.write(text)
            } else {
                const offset = this._anchoredLineOffsets.get(anchor) as number
                this._terminal.write("\u001b7") // save cursor
                this._terminal.write(`\u001b[${this._anchoredLineOffsets.size - offset}A`) // move cursor up
                this._terminal.write("\u001b[0K") // clear line
                this._terminal.write(text)
                this._terminal.write("\u001b8") // restore cursor
            }
        } else {
            this._terminal.write(text)
            this._anchoredLineOffsets.clear()
        }

    }

    enableStdin(onInput: (input: string) => void): void {
        this._terminal.setOption("disableStdin", false)
        this._terminal.onData(onInput)
    }

    writeServiceOutput(text: string): void {
        this._terminal.write(text)
    }

    clear(): void {
        this._terminal.clear()
        this._terminal.write("\u001b[2J") // clear screen
        this._terminal.write("\u001b[H") // move cursor to beginning of screen
    }

    override dispose(): void {
        Transaction.run(null, () => {
            if (this._mountContainer?.contains(this._terminalContainer))
                this._mountContainer?.removeChild(this._terminalContainer)
            this._terminal.dispose()
            this._fitAddon.dispose()
            this._resizeObserver.disconnect()
            super.dispose()
        })
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

    @reaction
    private updateTerminalTheme(): void {
        this._themeService.theme // subscribe
        this._terminal.setOption("theme", ConsoleRenderer.terminalTheme)
    }
}
