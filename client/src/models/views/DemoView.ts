import { SidePanel } from "../SidePanel"

export class DemoView {
  readonly leftPanel = new SidePanel("Demo")

  dispose(): void { this.leftPanel.dispose() }
}
