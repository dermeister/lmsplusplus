import { SidePanel } from "../SidePanel"

export class SolutionsView {
  readonly leftPanel = new SidePanel("Solutions")

  dispose(): void { this.leftPanel.dispose() }
}
