import { SidePanel } from "../SidePanel"

export class OptionsView {
  readonly leftPanel = new SidePanel("Options")

  dispose(): void { this.leftPanel.dispose() }
}
