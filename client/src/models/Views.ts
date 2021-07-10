import { cached, ObservableObject, reaction, transaction, unobservable } from "reactronic"
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
  activate(view: View): void {
    this._active = view
  }

  @reaction
  private syncSidePanels(): void {
    const views = [this.tasks, this.solutions, this.demo, this.options]
    const { opened } = this._active.leftPanel

    for (const view of views) {
      const { leftPanel } = view
      opened ? leftPanel.open() : leftPanel.close()
    }
  }
}
