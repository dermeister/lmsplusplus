import { Transaction } from "reactronic"
import { Disposable } from "../Disposable"
import { Preferences } from "../domain/Preferences"
import { Task } from "../domain/Task"
import { VcsConfiguration } from "../domain/VcsConfiguration"
import { PreferencesRepository, PreferencesRepositoryInternal } from "./PreferencesRepository"
import { TasksRepository, TasksRepositoryInternal } from "./TasksRepository"
import { VcsConfigurationRepositoryInternal, VscConfigurationRepository } from "./VscConfigurationRepository"

export class Database implements Disposable {
  private readonly _tasksRepository = new TasksRepositoryInternal()
  private readonly _preferencesRepository = new PreferencesRepositoryInternal()
  private readonly _vcsConfigurationRepository = new VcsConfigurationRepositoryInternal()

  get tasksRepository(): TasksRepository { return this._tasksRepository }
  get preferencesRepository(): PreferencesRepository { return this._preferencesRepository }
  get vcsConfigurationRepository(): VscConfigurationRepository { return this._vcsConfigurationRepository }

  dispose(): void {
    Transaction.run(() => {
      this._tasksRepository.dispose()
      this._preferencesRepository.dispose()
      this._vcsConfigurationRepository.dispose()
    })
  }

  async createTask(task: Task): Promise<void> {
    await this._tasksRepository.create(task)
  }

  async updateTask(task: Task): Promise<void> {
    await this._tasksRepository.update(task)
  }

  async deleteTask(task: Task): Promise<void> {
    await this._tasksRepository.delete(task)
  }

  async updatePreferences(preferences: Preferences): Promise<void> {
    await this._preferencesRepository.update(preferences)
  }

  async updateVscConfiguration(vscConfiguration: VcsConfiguration): Promise<void> {
    await this._vcsConfigurationRepository.update(vscConfiguration)
  }
}
