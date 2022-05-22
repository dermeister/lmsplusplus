import * as domain from "../domain"

export interface ITasksService {
  updateTask(task: domain.Task): void

  createSolution(task: domain.Task): void

  runSolution(solution: domain.Solution): void
}
