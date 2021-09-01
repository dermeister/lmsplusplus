import { transaction, Transaction, unobservable } from "reactronic"
import { Demo } from "../../domain/Demo"
import { DemoService } from "../../services/DemoService"
import { SidePanel } from "../SidePanel"
import { View } from "../View"
import { DemoExplorer } from "./DemoExplorer"

export class DemoView extends View {
  @unobservable readonly sidePanel = new SidePanel("Demo")
  @unobservable readonly explorer: DemoExplorer
  @unobservable readonly demoService: DemoService
  @unobservable private readonly demo: Demo
  private _isDemoStopped = false

  get isDemoStopped(): boolean { return this._isDemoStopped }

  constructor(demo: Demo) {
    super("Demo")
    this.demo = demo
    this.explorer = new DemoExplorer([this.demo])
    this.explorer.children[0].toggle()
    this.demoService = new DemoService(demo)
  }

  override dispose() {
    Transaction.run(() => {
      this.sidePanel.dispose()
      this.explorer.dispose()
      this.demoService.dispose()
      super.dispose();
    })
  }

  @transaction
  stop(): void {
    this._isDemoStopped = true
  }
}
