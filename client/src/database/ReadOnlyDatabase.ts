import { Monitor } from "reactronic"
import { Course } from "../domain/Course"
import { Demo } from "../domain/Demo"
import { Preferences } from "../domain/Preferences"
import { Solution } from "../domain/Solution"
import { Task } from "../domain/Task"
import { User } from "../domain/User"
import { VcsConfiguration } from "../domain/VcsConfiguration"

export interface ReadOnlyDatabase {
  get monitor(): Monitor

  get courses(): readonly Course[];

  get vcsConfiguration(): VcsConfiguration;

  get preferences(): Preferences;

  get user(): User;

  getSolutions(task: Task): readonly Solution[];

  getDemos(task: Task): readonly Demo[];
}
