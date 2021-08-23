import { reaction, transaction, Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { Database } from "../repositories"
import { TasksView } from "./tasks"
import { DemoView } from "./views/DemoView"
import { OptionsView } from "./views/OptionsView"
import { SolutionsView } from "./views/SolutionsView"

export type View = TasksView | DemoView | SolutionsView | OptionsView

export class App extends ObservableObject {
  @unobservable readonly tasks: TasksView
  @unobservable readonly solutions = new SolutionsView()
  @unobservable readonly demo = new DemoView()
  @unobservable readonly options = new OptionsView()
  @unobservable private readonly database = new Database()
  private _activeView: View

  get activeView(): View { return this._activeView }

  constructor() {
    super()
    this.tasks = new TasksView(this.database.tasksRepository)
    this._activeView = this.tasks
  }

  override dispose(): void {
    Transaction.run(() => {
      this.tasks.dispose()
      this.solutions.dispose()
      this.demo.dispose()
      this.options.dispose()
    })
  }

  @transaction setActiveView(view: View): void { this._activeView = view }

  @reaction
  private async createdTask_created_in_database(): Promise<void> {
    if (this.tasks.createdTask)
      await this.database.createTask(this.tasks.createdTask)
  }

  @reaction
  private async updatedTask_updated_in_database(): Promise<void> {
    if (this.tasks.updatedTask)
      await this.database.updateTask(this.tasks.updatedTask)
  }

  @reaction
  private async deletedTask_deleted_from_database(): Promise<void> {
    if (this.tasks.deletedTask)
      await this.database.deleteTask(this.tasks.deletedTask)
  }

  @reaction
  private all_left_panels_in_same_state_as_active(): void {
    const leftPanelsExceptActive = [this.tasks, this.solutions, this.demo, this.options]
      .filter(v => v !== this._activeView)
      .map(v => v.leftPanel)
    for (const leftPanel of leftPanelsExceptActive)
      this._activeView.leftPanel.isOpened ? leftPanel.open() : leftPanel.close()
  }
}
