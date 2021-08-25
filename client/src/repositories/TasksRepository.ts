import { monitor, Monitor, reaction, transaction } from "reactronic"
import { Course } from "../domain/Course"
import { Task } from "../domain/Task"
import { ObservableObject } from "../ObservableObject"

export abstract class TasksRepository extends ObservableObject {
  static readonly monitor = Monitor.create("Tasks monitor", 0, 0)
  protected _courses: Course[] = []

  get monitor(): Monitor { return TasksRepository.monitor }
  get courses(): readonly Course[] { return this._courses }
}

export class TasksRepositoryInternal extends TasksRepository {
  private static nextTaskId = 1
  private static nextCourseId = 1

  @transaction @monitor(TasksRepository.monitor)
  async create(task: Task): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))

    task = new Task(TasksRepositoryInternal.nextTaskId++, task.course, task.title, task.description)
    const courses = this._courses.toMutable()
    const course = courses.find(c => c.id === task.course.id)
    if (course) {
      const updatedCourse = new Course(course.id, course.name)
      updatedCourse.tasks = course.tasks.concat(task)
      courses.splice(courses.indexOf(course), 1, updatedCourse)
    }
    this._courses = courses
  }

  @transaction @monitor(TasksRepository.monitor)
  async update(task: Task): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))

    const courses = this._courses.toMutable()
    const course = courses.find(c => c.tasks.map(t => t.id).includes(task.id))
    if (course) {
      const oldTask = course.tasks.find(t => t.id === task.id)
      if (oldTask) {
        const updatedTask = new Task(task.id, task.course, task.title, task.description)
        const updatedCourse = new Course(course.id, course.name)
        updatedCourse.tasks = course.tasks.map(t => t === oldTask ? updatedTask : t)
        courses.splice(courses.indexOf(course), 1, updatedCourse)
      }
    }
    this._courses = courses
  }

  @transaction @monitor(TasksRepository.monitor)
  async delete(task: Task): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))

    const courses = this._courses.toMutable()
    const course = courses.find(c => c.tasks.map(t => t.id).includes(task.id))
    if (course) {
      const updatedCourse = new Course(course.id, course.name)
      updatedCourse.tasks = course.tasks.filter(t => t.id !== task.id)
      courses.splice(courses.indexOf(course), 1, updatedCourse)
    }
    this._courses = courses
  }

  @reaction @monitor(TasksRepository.monitor)
  private async tasks_fetched_from_api(): Promise<void> {
    const course1 = new Course(TasksRepositoryInternal.nextCourseId++, "СПП")
    course1.tasks = [
      new Task(TasksRepositoryInternal.nextTaskId++, course1, "Task 1", "Task 1"),
      new Task(TasksRepositoryInternal.nextTaskId++, course1, "Task 2", "Task 2")
    ]
    const course2 = new Course(TasksRepositoryInternal.nextCourseId++, "ЯП")
    course2.tasks = [
      new Task(TasksRepositoryInternal.nextTaskId++, course2, "Task 1", "Task 1"),
      new Task(TasksRepositoryInternal.nextTaskId++, course2, "Task 2", "Task 2"),
      new Task(TasksRepositoryInternal.nextTaskId++, course2, "Task 3", "Task 3")
    ]
    this._courses = await Promise.resolve([course1, course2])
  }
}
