import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { Disposable } from "../Disposable"
import { Demo, Service, ServiceType } from "../domain/Demo"

export class DemoService {
  private renderers = new Map<Service, Renderer>()

  constructor(demo: Demo) {
    for (const service of demo.services)
      this.renderers.set(service, DemoService.createRenderer(service))
  }

  dispose(): void {
    for (const renderer of this.renderers.values())
      renderer.dispose()
  }

  mount(service: Service, element: HTMLElement): void {
    this.ensureRendererExistsForService(service)
    const renderer = this.renderers.get(service) as Renderer
    renderer.mount(element)
  }

  unmount(service: Service): void {
    this.ensureRendererExistsForService(service)
    const renderer = this.renderers.get(service) as Renderer
    renderer.unmount()
  }

  private static createRenderer(service: Service): Renderer {
    switch (service.type) {
      case ServiceType.Console:
        return new ConsoleRenderer(service)
      case ServiceType.Web:
        return new WebRenderer()
    }
  }

  private ensureRendererExistsForService(service: Service): void {
    if (!this.renderers.has(service))
      throw new Error("Renderer is not registered for service")
  }
}

interface Renderer extends Disposable {
  mount(element: HTMLElement): void

  unmount(): void

  dispose(): void
}

const theme = () => ({
  background: getComputedStyle(document.documentElement)
    .getPropertyValue('--app-primary-background-color')
})

class ConsoleRenderer implements Renderer {
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

class WebRenderer implements Renderer {
  mount(element: HTMLElement): void {}

  unmount(): void {}

  dispose(): void {}
}
