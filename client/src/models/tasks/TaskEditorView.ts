import { reaction, Transaction, unobservable } from "reactronic"
import { Task } from "../../domain/Task"
import { SidePanel } from "../SidePanel"
import { View } from "../View"
import { TaskEditor } from "./TaskEditor"

export class TaskEditorView extends View {
  @unobservable readonly sidePanel = new SidePanel("Task Editor")
  @unobservable readonly taskEditor: TaskEditor
  private editedTask: Task | null = null
  private _editingCanceled = false

  get createdTask(): Task | null {
    const task = this.editedTask
    if (task?.id !== Task.NO_ID)
      return null
    return task
  }
  get updatedTask(): Task | null {
    const task = this.editedTask
    if (!task || task.id === Task.NO_ID)
      return null
    return task
  }
  get editingCanceled(): boolean { return this._editingCanceled }

  constructor(task: Task) {
    super("Editor")
    this.taskEditor = new TaskEditor(task)
  }

  override dispose() {
    Transaction.run(() => {
      this.sidePanel.dispose()
      this.taskEditor.dispose()
      super.dispose()
    })
  }

  @reaction
  private taskEditor_editResult_propagated(): void {
    const editResult = this.taskEditor?.editResult
    switch (editResult?.status) {
      case "saved":
        this.editedTask = editResult.task
        // Here _editedTask must be reset to null,
        // but can only be done when reactions are run in same transaction
        break
      case "canceled":
        this._editingCanceled = true
        break
    }
  }
}
