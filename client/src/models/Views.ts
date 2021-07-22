import { cached, reaction, Transaction, transaction, unobservable } from "reactronic"
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

  override dispose(): void {
    Transaction.run(() => {
      this.tasks.dispose()
      this.solutions.dispose()
      this.demo.dispose()
      this.options.dispose()
      super.dispose()
    })
  }

  @reaction
  private all_left_panels_in_same_state_as_active(): void {
    const leftPanelsExceptActive = [this.tasks, this.solutions, this.demo, this.options]
      .filter(v => v !== this._active)
      .map(v => v.leftPanel)
    for (const leftPanel of leftPanelsExceptActive)
      this._active.leftPanel.isOpened ? leftPanel.open() : leftPanel.close()
  }
}
