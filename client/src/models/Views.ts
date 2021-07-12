import { cached, reaction, transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { TasksView } from "./tasks/TasksView"
import { DemoView } from "./views/DemoView"
import { OptionsView } from "./views/OptionsView"
import { SolutionsView } from "./views/SolutionsView"

export type View = TasksView | DemoView | SolutionsView | OptionsView

export class Views extends ObservableObject {
  @unobservable readonly tasks = new TasksView()
  @unobservable readonly solutions = new SolutionsView()
  @unobservable readonly demo = new DemoView()
  @unobservable readonly options = new OptionsView()
  private _active: View = this.tasks

  @cached get active(): View { return this._active }

  @transaction
  activate(view: View): void { this._active = view }

  dispose(): void {
    this.tasks.dispose()
    this.solutions.dispose()
    this.demo.dispose()
    this.options.dispose()
    super.dispose()
  }

  @reaction
  private syncSidePanels(): void {
    const views = [this.tasks, this.solutions, this.demo, this.options]
    for (const view of views) {
      const { leftPanel } = view
      this._active.leftPanel ? leftPanel.open() : leftPanel.close()
    }
  }
}
