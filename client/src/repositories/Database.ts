import { Task } from "../domain/Task"
import { TasksRepository, TasksRepositoryInternal } from "./TasksRepository"

export class Database {
  private readonly _tasksRepository = new TasksRepositoryInternal()

  get tasksRepository(): TasksRepository { return this._tasksRepository }

  async createTask(task: Task): Promise<void> { await this._tasksRepository.create(task) }
  async updateTask(task: Task): Promise<void> { await this._tasksRepository.update(task) }
  async deleteTask(task: Task): Promise<void> { await this._tasksRepository.delete(task) }
}
