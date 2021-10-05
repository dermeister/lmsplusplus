import { transaction, Transaction, unobservable } from "reactronic"
import { Demo, Service, ServiceType } from "../domain/Demo"
import { ObservableObject } from "../ObservableObject"
import { ConsoleRenderer } from "./ConsoleRenderer"
import { Renderer } from "./Renderer"
import { WebRenderer } from "./WebRenderer"

export class DemoService extends ObservableObject {
  @unobservable private readonly demo: Demo
  private renderers = new Map<Service, Renderer>()
  private _isRunning = false

  get isRunning(): boolean { return this._isRunning }

  constructor(demo: Demo) {
    super()
    this.demo = demo
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
    const renderers = this.renderers.toMutable()
    for (const service of this.demo.services)
      renderers.set(service, DemoService.createRenderer(service))
    this.renderers = renderers
  }

  @transaction
  stop(): void {
    this._isRunning = false
    const renderers = this.renderers.toMutable()
    for (const renderer of renderers.values())
      renderer.dispose()
    renderers.clear()
    this.renderers = renderers
  }

  @transaction
  show(service: Service, element: HTMLElement): void {
    this.ensureRendererExistsForService(service)
    const renderer = this.renderers.get(service) as Renderer
    renderer.show(element)
  }

  @transaction
  hide(service: Service): void {
    this.ensureRendererExistsForService(service)
    const renderer = this.renderers.get(service) as Renderer
    renderer.hide()
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
