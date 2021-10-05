import { ITheme, Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { Service } from "../domain/Demo"
import { Renderer } from "./Renderer"

export class ConsoleRenderer implements Renderer {
  private readonly terminal = new Terminal({ theme: ConsoleRenderer.terminalTheme })
  private readonly fitAddon = new FitAddon()
  private readonly terminalContainer = document.createElement("div")
  private readonly resizeObserver = new ResizeObserver(() => this.resizeTerminalContainer())
  private mountContainer: HTMLElement | null = null

  private static get terminalTheme(): ITheme {
    const style = getComputedStyle(document.documentElement)
    return {
      background: style.getPropertyValue("--background-primary"),
      foreground: style.getPropertyValue("--text-primary"),
    }
  }

  constructor(service: Service) {
    this.terminal.loadAddon(this.fitAddon)
    this.terminal.write(service.name)
    this.styleTerminalContainer()
  }

  show(element: HTMLElement): void {
    this.resizeObserver.observe(this.terminalContainer)
    this.mountContainer = element
    element.appendChild(this.terminalContainer)
    if (!this.terminal.element) {
      this.terminal.open(this.terminalContainer)
      this.styleTerminalElement()
    }
  }

  hide(): void {
    this.mountContainer?.removeChild(this.terminalContainer)
    this.mountContainer = null
    this.resizeObserver.unobserve(this.terminalContainer)
  }

  dispose(): void {
    if (this.mountContainer?.contains(this.terminalContainer))
      this.mountContainer?.removeChild(this.terminalContainer)
    this.terminal.dispose()
    this.fitAddon.dispose()
    this.resizeObserver.disconnect()
  }

  private resizeTerminalContainer(): void {
    setTimeout(() => {
      if (this.terminalContainer.isConnected)
        this.fitAddon.fit()
    }, 0)
  }

  private styleTerminalContainer(): void {
    this.terminalContainer.style.width = "100%"
    this.terminalContainer.style.height = "100%"
    this.terminalContainer.style.backgroundColor = ConsoleRenderer.terminalTheme.background ?? "black"
  }

  private styleTerminalElement(): void {
    const terminalElement = this.terminalContainer.querySelector(".terminal")
    if (terminalElement instanceof HTMLElement)
      terminalElement.style.padding = "14px"
  }
}
