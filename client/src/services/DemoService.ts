import { transaction, Transaction } from "reactronic"
import { Demo, Service, ServiceType } from "../domain/Demo"
import { ObservableObject } from "../ObservableObject"
import { ConsoleRenderer } from "./ConsoleRenderer"
import { Renderer } from "./Renderer"
import { WebRenderer } from "./WebRenderer"

export class DemoService extends ObservableObject {
  private readonly renderers = new Map<Service, Renderer>()
  private _isRunning = false

  get isRunning(): boolean { return this._isRunning }

  constructor(demo: Demo) {
    super()
    for (const service of demo.services)
      this.renderers.set(service, DemoService.createRenderer(service))
  }

  override dispose(): void {
    Transaction.run(() => {
      for (const renderer of this.renderers.values())
        renderer.dispose()
      super.dispose()
    })
  }

  @transaction
  start(): void {
    this._isRunning = true
  }

  @transaction
  stop(): void {
    this._isRunning = false
  }

  @transaction
  mount(service: Service, element: HTMLElement): void {
    this.ensureRendererExistsForService(service)
    const renderer = this.renderers.get(service) as Renderer
    renderer.mount(element)
  }

  @transaction
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
