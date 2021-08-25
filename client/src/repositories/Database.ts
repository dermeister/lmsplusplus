import { Preferences } from "../domain/Preferences"
import { Task } from "../domain/Task"
import { VcsConfiguration } from "../domain/VcsConfiguration"
import { PreferencesRepository, PreferencesRepositoryInternal } from "./PreferencesRepository"
import { TasksRepository, TasksRepositoryInternal } from "./TasksRepository"
import { VscConfigurationRepository, VscConfigurationRepositoryInternal } from "./VscConfigurationRepository"

export class Database {
  private readonly _tasksRepository = new TasksRepositoryInternal()
  private readonly _preferencesRepository = new PreferencesRepositoryInternal()
  private readonly _vcsConfigurationRepository = new VscConfigurationRepositoryInternal()

  get tasksRepository(): TasksRepository { return this._tasksRepository }
  get preferencesRepository(): PreferencesRepository { return this._preferencesRepository }
  get vcsConfigurationRepository(): VscConfigurationRepository { return this._vcsConfigurationRepository }

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
