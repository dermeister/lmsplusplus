import { reaction, transaction, Transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import * as services from "../../services"
import { SidePanel } from "../SidePanel"
import { View } from "../View"
import { MultipleDemosExplorer } from "./MultipleDemosExplorer"
import { SingleDemoExplorer } from "./SingleDemoExplorer"

export class DemoView extends View {
  @unobservable readonly sidePanel = new SidePanel("Demo")
  @unobservable readonly explorer: SingleDemoExplorer | MultipleDemosExplorer
  @unobservable readonly demos: readonly domain.Demo[]
  @unobservable private readonly demoServices = new Map<domain.Demo, services.DemoService>()
  private _isViewClosed = false
  private mountContainer: HTMLElement | null = null
  private shownService: domain.Service | null = null

  get isViewClosed(): boolean { return this._isViewClosed }

  constructor(demos: readonly domain.Demo[], key: string) {
    super("Demo", key)
    this.demos = demos
    this.explorer = this.createExplorer(this.demos)
    demos.forEach(demo => this.demoServices.set(demo, new services.DemoService(demo)))
  }

  override dispose(): void {
    Transaction.run(() => {
      this.sidePanel.dispose()
      this.explorer?.dispose()
      for (const demoService of this.demoServices.values())
        demoService.dispose()
      super.dispose()
    })
  }

  @transaction
  mount(element: HTMLElement): void {
    this.mountContainer = element
  }

  @transaction
  unmount(): void {
    this.mountContainer = null
  }

  @transaction
  start(demo: domain.Demo): void {
    this.ensureDemoServiceRegisteredForDemo(demo)
    const demoService = this.demoServices.get(demo) as services.DemoService
    demoService.start()
  }

  @transaction
  stop(demo: domain.Demo): void {
    this.ensureDemoServiceRegisteredForDemo(demo)
    const demoService = this.demoServices.get(demo) as services.DemoService
    demoService.stop()
  }

  isDemoRunning(demo: domain.Demo): boolean {
    this.ensureDemoServiceRegisteredForDemo(demo)
    const demoService = this.demoServices.get(demo) as services.DemoService
    return demoService.isRunning
  }

  @transaction
  close(): void {
    for (const service of this.demoServices.values())
      service.stop()
    this._isViewClosed = true
  }

  getDemoService(service: domain.Service): services.DemoService {
    this.ensureDemoServiceRegisteredForDemo(service.demo)
    return this.demoServices.get(service.demo) as services.DemoService
  }

  @transaction
  private createExplorer(demos: readonly domain.Demo[]): SingleDemoExplorer | MultipleDemosExplorer {
    if (demos.length === 1)
      return new SingleDemoExplorer(demos[0])
    return new MultipleDemosExplorer(this.demos)
  }

  @transaction
  private ensureDemoServiceRegisteredForDemo(demo: domain.Demo): void {
    if (!this.demoServices.has(demo))
      throw new Error("DemoService has not been registered for Demo")
  }

  @reaction
  private selectedService_is_shown(): void {
    const service = this.explorer.selectedService
    if (service && this.mountContainer) {
      this.ensureDemoServiceRegisteredForDemo(service.demo)
      const demoService = this.getDemoService(service)
      if (demoService.isRunning) {
        if (this.shownService)
          demoService.hide(this.shownService)
        demoService.show(service, this.mountContainer)
        this.shownService = service
      }
    } else if (service) {
      this.ensureDemoServiceRegisteredForDemo(service.demo)
      const demoService = this.getDemoService(service)
      if (demoService.isRunning)
        demoService.hide(service)
    }
  }
}
