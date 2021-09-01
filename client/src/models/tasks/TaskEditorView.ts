import { Transaction, unobservable } from "reactronic"
import { Task } from "../../domain/Task"
import { SidePanel } from "../SidePanel"
import { View } from "../View"
import { TaskEditor } from "./TaskEditor"

export class TaskEditorView extends View {
  @unobservable readonly sidePanel = new SidePanel("Task Editor")
  @unobservable readonly taskEditor: TaskEditor

  get createdTask(): Task | null { return this.editedTask?.id === Task.NO_ID ? this.editedTask : null }
  get updatedTask(): Task | null { return this.editedTask?.id !== Task.NO_ID ? this.editedTask : null }
  get editingCanceled(): boolean { return this.taskEditor.editResult?.status === "canceled" }
  private get editedTask(): Task | null {
    if (this.taskEditor.editResult?.status !== "saved")
      return null
    return this.taskEditor.editResult.task
  }

  constructor(task: Task) {
    super("Editor")
    this.taskEditor = new TaskEditor(task)
  }

  override dispose(): void {
    Transaction.run(() => {
      this.sidePanel.dispose()
      this.taskEditor.dispose()
      super.dispose()
    })
  }
}
