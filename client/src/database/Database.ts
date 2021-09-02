import { Monitor, monitor, reaction, transaction } from "reactronic"
import bitbucketIcon from "../assets/bitbucket.svg"
import githubIcon from "../assets/github.svg"
import gitlabIcon from "../assets/gitlab.svg"
import { Course } from "../domain/Course"
import { Demo, Service, ServiceType } from "../domain/Demo"
import { Preferences } from "../domain/Preferences"
import { Solution } from "../domain/Solution"
import { Task } from "../domain/Task"
import { User } from "../domain/User"
import { Account, Provider, VcsConfiguration } from "../domain/VcsConfiguration"
import { ObservableObject } from "../ObservableObject"
import { ReadOnlyDatabase } from "./ReadOnlyDatabase"

export class Database extends ObservableObject implements ReadOnlyDatabase {
  private static readonly _monitor = Monitor.create("Database", 0, 0)
  private static nextId = 1
  private _courses: Course[] = []
  private _solutions: Solution[] = []
  private _demos: Demo[] = []
  private _vcsConfiguration = VcsConfiguration.default
  private _preferences = Preferences.default
  private _user = User.default

  get monitor(): Monitor { return Database._monitor }
  get courses(): readonly Course[] { return this._courses }
  get vcsConfiguration(): VcsConfiguration { return this._vcsConfiguration }
  get preferences(): Preferences { return this._preferences }
  get user(): User { return this._user }

  getSolutions(task: Task): readonly Solution[] {
    return this._solutions.filter(s => s.task === task)
  }

  getDemos(task: Task): readonly Demo[] {
    return this._demos.filter(d => d.solution.task === task)
  }

  @transaction @monitor(Database._monitor)
  async createTask(task: Task): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))

    task = new Task(Database.nextId++, task.course, task.title, task.description)
    const courses = this._courses.toMutable()
    const course = courses.find(c => c.id === task.course.id)
    if (course) {
      const updatedCourse = new Course(course.id, course.name)
      updatedCourse.tasks = course.tasks.concat(task)
      courses.splice(courses.indexOf(course), 1, updatedCourse)
    }
    this._courses = courses
  }

  @transaction @monitor(Database._monitor)
  async updateTask(task: Task): Promise<void> {
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

  @transaction @monitor(Database._monitor)
  async deleteTask(task: Task): Promise<void> {
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

  @transaction @monitor(Database._monitor)
  async updatePreferences(preferences: Preferences): Promise<void> {
    await new Promise(r => setTimeout(r, 0))

    this._preferences = preferences
  }

  @transaction @monitor(Database._monitor)
  async updateUser(user: User): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))

    this._user = user
  }

  @transaction @monitor(Database._monitor)
  async updateVcsConfiguration(vcsConfiguration: VcsConfiguration): Promise<void> {
    await new Promise(r => setTimeout(r, 0))

    this._vcsConfiguration = vcsConfiguration
  }

  @reaction
  private async data_fetched_from_api(): Promise<void> {
    // courses
    const course1 = new Course(Database.nextId++, "СПП")
    course1.tasks = [
      new Task(Database.nextId++, course1, "Task 1", "Task 1"),
      new Task(Database.nextId++, course1, "Task 2", "Task 2")
    ]
    const course2 = new Course(Database.nextId++, "ЯП")
    course2.tasks = [
      new Task(Database.nextId++, course2, "Task 1", "Task 1"),
      new Task(Database.nextId++, course2, "Task 2", "Task 2"),
      new Task(Database.nextId++, course2, "Task 3", "Task 3")
    ]
    this._courses = await Promise.resolve([course1, course2])

    // solutions
    const solution = new Solution(Database.nextId++, this._courses[0].tasks[0], "Solution for task 1")
    this._solutions = await Promise.resolve([solution])

    // demos
    const demo = new Demo(Database.nextId++, this._solutions[0])
    const consoleService = new Service(Database.nextId++, demo, "Console App", ServiceType.Console)
    const webService = new Service(Database.nextId++, demo, "Web App", ServiceType.Web)
    demo.services = [consoleService, webService]
    this._demos = await Promise.resolve([demo])

    // preferences
    this._preferences = await Promise.resolve(new Preferences(true))

    // vcs configuration
    const github = new Provider(Database.nextId++, "GitHub", githubIcon)
    const bitbucket = new Provider(Database.nextId++, "BitBucket", bitbucketIcon)
    const gitlab = new Provider(Database.nextId++, "GitLab", gitlabIcon)
    const account1 = new Account(Database.nextId++, github, "dermeister")
    const account2 = new Account(Database.nextId++, github, "denis.duzh")
    const account3 = new Account(Database.nextId++, bitbucket, "dermeister")
    const account4 = new Account(Database.nextId++, bitbucket, "denis.duzh")
    const account5 = new Account(Database.nextId++, gitlab, "dermeister")
    const account6 = new Account(Database.nextId++, gitlab, "denis.duzh")
    const providers = [github, bitbucket, gitlab]
    const accounts = [account1, account2, account3, account4, account5, account6]
    this._vcsConfiguration = await Promise.resolve(new VcsConfiguration(providers, accounts, account1))

    // user
    this._user = await Promise.resolve(new User())
  }
}
