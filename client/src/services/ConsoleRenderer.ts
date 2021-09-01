import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { Service } from "../domain/Demo"
import { Renderer } from "./Renderer"

const theme = () => ({
  background: getComputedStyle(document.documentElement)
    .getPropertyValue('--app-primary-background-color')
})

export class ConsoleRenderer implements Renderer {
  private terminal = new Terminal({ theme: theme() })
  private fitAddon = new FitAddon()
  private terminalContainer = document.createElement("div")
  private resizeObserver = new ResizeObserver(() => this.resizeTerminalContainer())
  private mountContainer: HTMLElement | null = null

  constructor(service: Service) {
    this.terminal.loadAddon(this.fitAddon)
    this.terminal.write(service.name)
    this.terminalContainer.style.width = "100%"
    this.terminalContainer.style.height = "100%"
    this.terminalContainer.style.backgroundColor = this.terminal.getOption("theme").background
  }

  mount(element: HTMLElement): void {
    this.resizeObserver.observe(this.terminalContainer)
    this.mountContainer = element
    element.appendChild(this.terminalContainer)
    if (!this.terminal.element)
      this.terminal.open(this.terminalContainer)
  }

  unmount(): void {
    this.mountContainer?.removeChild(this.terminalContainer)
    this.mountContainer = null
    this.resizeObserver.unobserve(this.terminalContainer)
  }

  dispose(): void {
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
}
