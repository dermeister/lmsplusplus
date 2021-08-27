import { Task } from "./Task"

export class Solution {
  readonly id: number
  readonly task: Task
  readonly name: string

  constructor(id: number, task: Task, name: string) {
    this.id = id
    this.task = task
    this.name = name
  }
}
