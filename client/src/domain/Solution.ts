import { Demo } from "./Demo"
import { Task } from "./Task"

export class Solution {
  readonly id: number
  readonly task: Task
  readonly name: string
  private _demo: Demo | null = null
  private demoInitialized = false

  get demo(): Demo {
    if (!this.demoInitialized)
      throw new Error("Solution demo has not been initialized")
    return this._demo as Demo
  }
  set demo(demo: Demo) {
    if (!this.demoInitialized) {
      this._demo = demo
      this.demoInitialized = true
    } else
      throw new Error("Solution demo has already been initialized")
  }

  constructor(id: number, task: Task, name: string) {
    this.id = id
    this.task = task
    this.name = name
  }
}
