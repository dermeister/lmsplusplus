import { reaction, transaction } from "reactronic"
import bitbucketIcon from "../assets/bitbucket.svg"
import githubIcon from "../assets/github.svg"
import gitlabIcon from "../assets/gitlab.svg"
import * as domain from "../domain"
import { ObservableObject } from "../ObservableObject"

export class Database extends ObservableObject {
    private static s_nextId = 1
    private _courses: domain.Course[] = []
    private _vcsConfiguration = domain.VcsConfiguration.default
    private _preferences = domain.Preferences.default
    private _user = domain.User.default
    private _permissions = domain.Permissions.default
    private _technologies: readonly string[] = []

    get courses(): readonly domain.Course[] { return this._courses }
    get technologies(): readonly string[] { return this._technologies }
    get vcsConfiguration(): domain.VcsConfiguration { return this._vcsConfiguration }
    get preferences(): domain.Preferences { return this._preferences }
    get user(): domain.User { return this._user }
    get permissions(): domain.Permissions { return this._permissions }

    @transaction
    async createTask(task: domain.Task): Promise<void> {
        if (!this._permissions.canCreateTask)
            throw this.permissionError()

        await new Promise(r => setTimeout(r, 1000))

        const newTask = new domain.Task(Database.s_nextId++, task.course, task.title, task.description, task.technologies)
        newTask.solutions = task.solutions
        const courses = this._courses.toMutable()
        const course = courses.find(c => c.id === newTask.course.id)
        if (course) {
            const updatedCourse = new domain.Course(course.id, course.name)
            updatedCourse.tasks = course.tasks.concat(newTask)
            courses.splice(courses.indexOf(course), 1, updatedCourse)
        }
        this._courses = courses
    }

    @transaction
    async updateTask(task: domain.Task): Promise<void> {
        if (!this._permissions.canUpdateTask)
            throw this.permissionError()

        await new Promise(r => setTimeout(r, 1000))

        const courses = this._courses.toMutable()
        const course = courses.find(c => c.tasks.map(t => t.id).includes(task.id))
        if (course) {
            const oldTask = course.tasks.find(t => t.id === task.id)
            if (oldTask) {
                const updatedTask = new domain.Task(task.id, task.course, task.title, task.description, task.technologies)
                updatedTask.solutions = task.solutions
                const updatedCourse = new domain.Course(course.id, course.name)
                updatedCourse.tasks = course.tasks.map(t => t === oldTask ? updatedTask : t)
                courses.splice(courses.indexOf(course), 1, updatedCourse)
            }
        }
        this._courses = courses
    }

    @transaction
    async deleteTask(task: domain.Task): Promise<void> {
        if (!this._permissions.canDeleteTask)
            throw this.permissionError()

        await new Promise(r => setTimeout(r, 1000))

        const courses = this._courses.toMutable()
        const course = courses.find(c => c.tasks.map(t => t.id).includes(task.id))
        if (course) {
            const updatedCourse = new domain.Course(course.id, course.name)
            updatedCourse.tasks = course.tasks.filter(t => t.id !== task.id)
            courses.splice(courses.indexOf(course), 1, updatedCourse)
        }
        this._courses = courses
    }

    @transaction
    async updatePreferences(preferences: domain.Preferences): Promise<void> {
        await new Promise(r => setTimeout(r, 0))

        this._preferences = preferences
    }

    @transaction
    async updateUser(user: domain.User): Promise<void> {
        if (!this._permissions.canUpdateUser)
            throw this.permissionError()

        await new Promise(r => setTimeout(r, 1000))

        this._user = user
    }

    @transaction
    async updateVcsConfiguration(vcsConfiguration: domain.VcsConfiguration): Promise<void> {
        if (!this._permissions.canUpdateVcsConfiguration)
            throw this.permissionError()

        await new Promise(r => setTimeout(r, 0))

        this._vcsConfiguration = vcsConfiguration
    }

    @transaction
    async createSolution(solution: domain.Solution): Promise<void> {
        if (!this._permissions.canCreateSolution)
            throw this.permissionError()

        await new Promise(r => setTimeout(r, 1000))

        solution = new domain.Solution(Database.s_nextId++, solution.task, solution.name)
        const courses = this._courses.toMutable()
        const course = courses.find(c => c.id === solution.task.course.id)
        if (course) {
            const oldTask = course.tasks.find(t => t.id === solution.task.id)
            if (oldTask) {
                const updatedTask = new domain.Task(oldTask.id, oldTask.course, oldTask.title, oldTask.description,
                    oldTask.technologies)
                updatedTask.solutions = oldTask.solutions.concat(solution)
                const updatedCourse = new domain.Course(course.id, course.name)
                updatedCourse.tasks = course.tasks.map(t => t === oldTask ? updatedTask : t)
                courses.splice(courses.indexOf(course), 1, updatedCourse)
            }
        }
        this._courses = courses
    }

    @transaction
    async deleteSolution(solution: domain.Solution): Promise<void> {
        if (!this._permissions.canDeleteSolution)
            throw this.permissionError()

        await new Promise(r => setTimeout(r, 1000))

        const courses = this._courses.toMutable()
        const course = courses.find(c => c.id === solution.task.course.id)
        if (course) {
            const oldTask = course.tasks.find(t => t.id === solution.task.id)
            if (oldTask) {
                const updatedTask = new domain.Task(oldTask.id, oldTask.course, oldTask.title, oldTask.description,
                    oldTask.technologies)
                updatedTask.solutions = oldTask.solutions.filter(s => s.id !== solution.id)
                const updatedCourse = new domain.Course(course.id, course.name)
                updatedCourse.tasks = course.tasks.map(t => t === oldTask ? updatedTask : t)
                courses.splice(courses.indexOf(course), 1, updatedCourse)
            }
        }
        this._courses = courses
    }

    @transaction
    private permissionError(): Error {
        return new Error("Permission error")
    }

    @reaction
    private async data_fetched_from_api(): Promise<void> {
        // technologies
        this._technologies = ["Java", "C#", "C", "C++", "PHP", "JavaScript"]

        // courses
        const course1 = new domain.Course(Database.s_nextId++, "СПП")
        course1.tasks = [
            new domain.Task(Database.s_nextId++, course1, "Task 1", "# Task 1", [this._technologies[0]]),
            new domain.Task(Database.s_nextId++, course1, "Task 2", "# Task 2", [this._technologies[1]])
        ]
        const course2 = new domain.Course(Database.s_nextId++, "ЯП")
        course2.tasks = [
            new domain.Task(Database.s_nextId++, course2, "Task 1", "# Task 1", [this._technologies[2]]),
            new domain.Task(Database.s_nextId++, course2, "Task 2", "# Task 2", [this._technologies[3]]),
            new domain.Task(Database.s_nextId++, course2, "Task 3", "# Task 3", [this._technologies[4]])
        ]
        this._courses = [course1, course2]

        // solutions
        const solution = new domain.Solution(Database.s_nextId++, this._courses[0].tasks[0], "Solution for task 1")
        this._courses[0].tasks[0].solutions = [solution]
        this._courses[0].tasks[1].solutions = []
        this._courses[1].tasks[0].solutions = []
        this._courses[1].tasks[1].solutions = []
        this._courses[1].tasks[2].solutions = []

        // preferences
        this._preferences = await new domain.Preferences(true)

        // vcs configuration
        const github = new domain.Provider(Database.s_nextId++, "GitHub", githubIcon)
        const bitbucket = new domain.Provider(Database.s_nextId++, "BitBucket", bitbucketIcon)
        const gitlab = new domain.Provider(Database.s_nextId++, "GitLab", gitlabIcon)
        const account1 = new domain.Account(Database.s_nextId++, github, "dermeister")
        const account2 = new domain.Account(Database.s_nextId++, github, "denis.duzh")
        const account3 = new domain.Account(Database.s_nextId++, bitbucket, "dermeister")
        const account4 = new domain.Account(Database.s_nextId++, bitbucket, "denis.duzh")
        const account5 = new domain.Account(Database.s_nextId++, gitlab, "dermeister")
        const account6 = new domain.Account(Database.s_nextId++, gitlab, "denis.duzh")
        const providers = [github, bitbucket, gitlab]
        const accounts = [account1, account2, account3, account4, account5, account6]
        this._vcsConfiguration = await new domain.VcsConfiguration(providers, accounts, account1)

        // user
        this._user = await new domain.User()

        // permissions
        this._permissions = await domain.Permissions.teacher
    }
}
