import * as domain from "../domain"

export interface ITasksService {
  createTask(topic: domain.Topic): void

  updateTask(task: domain.Task): void

  deleteTask(task: domain.Task): void

  createSolution(task: domain.Task): void

  deleteSolution(task: domain.Solution): void

  runSolution(solution: domain.Solution): void
}
