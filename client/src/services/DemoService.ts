import { Demo, Service, ServiceType } from "../domain/Demo"
import { ConsoleRenderer } from "./ConsoleRenderer"
import { Renderer } from "./Renderer"
import { WebRenderer } from "./WebRenderer"

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
