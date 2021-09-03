import { transaction, Transaction, unobservable } from "reactronic"
import { Demo, Service } from "../../domain/Demo"
import * as services from "../../services"
import { SidePanel } from "../SidePanel"
import { View } from "../View"
import { MultipleDemosExplorer } from "./MultipleDemosExplorer"
import { SingleDemoExplorer } from "./SingleDemoExplorer"

export class DemoView extends View {
  @unobservable readonly sidePanel = new SidePanel("Demo")
  @unobservable readonly explorer: SingleDemoExplorer | MultipleDemosExplorer
  @unobservable readonly demos: readonly Demo[]
  @unobservable private readonly services = new Map<Demo, services.DemoService>()
  private _isViewClosed = false

  get isViewClosed(): boolean { return this._isViewClosed }

  constructor(demos: readonly Demo[], key: string) {
    super("Demo", key)
    this.demos = demos
    this.explorer = this.createExplorer(this.demos)
    demos.forEach(demo => this.services.set(demo, new services.DemoService(demo)))
  }

  override dispose(): void {
    Transaction.run(() => {
      this.sidePanel.dispose()
      this.explorer?.dispose()
      for (const service of this.services.values())
        service.dispose()
      super.dispose()
    })
  }

  @transaction
  start(demo: Demo): void {
    this.ensureDemoServiceRegisteredForDemo(demo)
    const service = this.services.get(demo) as services.DemoService
    service.start()
  }

  isDemoRunning(demo: Demo): boolean {
    this.ensureDemoServiceRegisteredForDemo(demo)
    const service = this.services.get(demo) as services.DemoService
    return service.isRunning
  }

  @transaction
  stop(demo: Demo): void {
    this.ensureDemoServiceRegisteredForDemo(demo)
    const service = this.services.get(demo) as services.DemoService
    service.stop()
  }

  @transaction
  close(): void {
    for (const service of this.services.values())
      service.stop()
    this._isViewClosed = true
  }

  getDemoService(service: Service): services.DemoService {
    this.ensureDemoServiceRegisteredForDemo(service.demo)
    return this.services.get(service.demo) as services.DemoService
  }

  @transaction
  private createExplorer(demos: readonly Demo[]): SingleDemoExplorer | MultipleDemosExplorer {
    if (demos.length === 1)
      return new SingleDemoExplorer(demos[0])
    return new MultipleDemosExplorer(this.demos)
  }

  @transaction
  private ensureDemoServiceRegisteredForDemo(demo: Demo): void {
    if (!this.services.has(demo))
      throw new Error("DemoService has not been registered for Demo")
  }
}
