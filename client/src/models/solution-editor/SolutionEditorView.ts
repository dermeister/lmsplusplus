import { View } from "../View"
import * as domain from "../../domain"
import { Monitor, Transaction, transaction, unobservable } from "reactronic"
import { SidePanel } from "../SidePanel"

export class SolutionEditorView extends View {
  @unobservable readonly monitor: Monitor
  @unobservable readonly sidePanel = new SidePanel("Solution")
  @unobservable private readonly id: number
  @unobservable private readonly task: domain.Task
  @unobservable private readonly demo: domain.Demo
  private _name: string
  private _createdSolution: domain.Solution | null = null
  private _updatedSolution: domain.Solution | null = null
  private _isViewClosed = false

  get name(): string { return this._name }
  get createdSolution(): domain.Solution | null { return this._createdSolution }
  get updatedSolution(): domain.Solution | null { return this._updatedSolution }
  get isViewClosed(): boolean { return this._isViewClosed }

  constructor(solution: domain.Solution, monitor: Monitor, key: string) {
    super("Editor", key)
    this.id = solution.id
    this.task = solution.task
    this.demo = solution.demo
    this._name = solution.name
    this.monitor = monitor
  }

  @transaction
  setSolutionName(name: string): void {
    this._name = name
  }

  @transaction
  save(): void {
    const solution = new domain.Solution(this.id, this.task, this._name)
    solution.demo = this.demo
    if (solution.id === domain.Solution.NO_ID)
      this._createdSolution = solution
    else
      this._updatedSolution = solution
  }

  @transaction
  cancel(): void {
    this._isViewClosed = true
  }

  override dispose(): void {
    Transaction.run(() => {
      this.sidePanel.dispose()
      super.dispose()
    })
  }
}
