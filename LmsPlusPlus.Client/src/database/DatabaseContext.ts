import { reaction, transaction } from "reactronic"
import * as domain from "../domain"
import { ObservableObject } from "../ObservableObject"
import { Api } from "./Api"
import { VcsAccountRegisteringModal } from "./VcsAccountRegisteringModal"
import githubIcon from "../assets/github.svg"
import bitbucketIcon from "../assets/bitbucket.svg"
import gitlabIcon from "../assets/gitlab.svg"
import * as response from "./response"

export class DatabaseContext extends ObservableObject {
    private static s_nextId = 1
    private _courses: domain.Topic[] = []
    private _vcsConfiguration = domain.VcsConfiguration.default
    private _preferences = domain.Preferences.default
    private _user = domain.User.default
    private _permissions = domain.Permissions.default
    private _technologies: readonly domain.Technology[] = []

    get courses(): readonly domain.Topic[] { return this._courses }
    get technologies(): readonly domain.Technology[] { return this._technologies }
    get vcsConfiguration(): domain.VcsConfiguration { return this._vcsConfiguration }
    get preferences(): domain.Preferences { return this._preferences }
    get user(): domain.User { return this._user }
    get permissions(): domain.Permissions { return this._permissions }

    @transaction
    async createTask(task: domain.Task): Promise<void> {
        if (!this._permissions.canCreateTask)
            throw this.permissionError()

        await new Promise(r => setTimeout(r, 1000))

        const newTask = new domain.Task(DatabaseContext.s_nextId++, task.topic, task.title, task.description, task.technologies)
        newTask.solutions = task.solutions
        const courses = this._courses.toMutable()
        const course = courses.find(c => c.id === newTask.topic.id)
        if (course) {
            const updatedCourse = new domain.Topic(course.id, course.name)
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
                const updatedTask = new domain.Task(task.id, task.topic, task.title, task.description, task.technologies)
                updatedTask.solutions = task.solutions
                const updatedCourse = new domain.Topic(course.id, course.name)
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
            const updatedCourse = new domain.Topic(course.id, course.name)
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

        solution = new domain.Solution(DatabaseContext.s_nextId++, solution.task, solution.name, solution.technology)
        const courses = this._courses.toMutable()
        const course = courses.find(c => c.id === solution.task.topic.id)
        if (course) {
            const oldTask = course.tasks.find(t => t.id === solution.task.id)
            if (oldTask) {
                const updatedTask = new domain.Task(oldTask.id, oldTask.topic, oldTask.title, oldTask.description,
                    oldTask.technologies)
                updatedTask.solutions = oldTask.solutions.concat(solution)
                const updatedCourse = new domain.Topic(course.id, course.name)
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
        const course = courses.find(c => c.id === solution.task.topic.id)
        if (course) {
            const oldTask = course.tasks.find(t => t.id === solution.task.id)
            if (oldTask) {
                const updatedTask = new domain.Task(oldTask.id, oldTask.topic, oldTask.title, oldTask.description,
                    oldTask.technologies)
                updatedTask.solutions = oldTask.solutions.filter(s => s.id !== solution.id)
                const updatedCourse = new domain.Topic(course.id, course.name)
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
        this._technologies = [new domain.Technology(DatabaseContext.s_nextId++, "Java")]

        // courses
        const course1 = new domain.Topic(DatabaseContext.s_nextId++, "СПП")
        course1.tasks = [
            new domain.Task(DatabaseContext.s_nextId++, course1, "Task 1", "# Task 1", [this._technologies[0]]),
            new domain.Task(DatabaseContext.s_nextId++, course1, "Task 2", "# Task 2", [this._technologies[0]])
        ]
        const course2 = new domain.Topic(DatabaseContext.s_nextId++, "ЯП")
        course2.tasks = [
            new domain.Task(DatabaseContext.s_nextId++, course2, "Task 1", "# Task 1", [this._technologies[0]]),
            new domain.Task(DatabaseContext.s_nextId++, course2, "Task 2", "# Task 2", [this._technologies[0]]),
            new domain.Task(DatabaseContext.s_nextId++, course2, "Task 3", "# Task 3", [this._technologies[0]])
        ]
        this._courses = [course1, course2]

        // solutions
        const solution = new domain.Solution(DatabaseContext.s_nextId++, this._courses[0].tasks[0], "Solution for task 1", this._technologies[0])
        this._courses[0].tasks[0].solutions = [solution]
        this._courses[0].tasks[1].solutions = []
        this._courses[1].tasks[0].solutions = []
        this._courses[1].tasks[1].solutions = []
        this._courses[1].tasks[2].solutions = []

        // preferences
        this._preferences = await new domain.Preferences(DatabaseContext.s_nextId++, true)

        // vcs configuration
        const github = new domain.Provider("github", "GitHub", githubIcon)
        const bitbucket = new domain.Provider("bitbucket", "BitBucket", bitbucketIcon)
        const gitlab = new domain.Provider("gitlab", "GitLab", gitlabIcon)
        const account1 = new domain.Account(DatabaseContext.s_nextId++, github, "dermeister")
        const account2 = new domain.Account(DatabaseContext.s_nextId++, github, "denis.duzh")
        const account3 = new domain.Account(DatabaseContext.s_nextId++, bitbucket, "dermeister")
        const account4 = new domain.Account(DatabaseContext.s_nextId++, bitbucket, "denis.duzh")
        const account5 = new domain.Account(DatabaseContext.s_nextId++, gitlab, "dermeister")
        const account6 = new domain.Account(DatabaseContext.s_nextId++, gitlab, "denis.duzh")
        const providers = [github, bitbucket, gitlab]
        const accounts = [account1, account2, account3, account4, account5, account6]
        this._vcsConfiguration = await new domain.VcsConfiguration(providers, accounts, account1)

        // user
        this._user = await new domain.User()

        // permissions
        this._permissions = new domain.Permissions(DatabaseContext.s_nextId++, true, true, true, true, true, true, true)
    }
}

// export class DatabaseContext extends ObservableObject {
//     private readonly _api = new Api()
//     private _topics = new Map<number, domain.Topic>()
//     private _technologies = new Map<number, domain.Technology>()
//     private _vcsConfiguration = domain.VcsConfiguration.default
//     private _preferences = domain.Preferences.default
//     private _user = domain.User.default
//     private _permissions = domain.Permissions.default

//     get topics(): readonly domain.Topic[] { return Array.from(this._topics.values()) }
//     get technologies(): readonly domain.Technology[] { return Array.from(this._technologies.values()) }
//     get vcsConfiguration(): domain.VcsConfiguration { return this._vcsConfiguration }
//     get preferences(): domain.Preferences { return this._preferences }
//     get user(): domain.User { return this._user }
//     get permissions(): domain.Permissions { return this._permissions }

//     @transaction
//     async createTask(task: domain.Task): Promise<void> {
//         if (!this._permissions.canCreateTask)
//             throw this.permissionError()
//         const requestBody = {
//             title: task.title,
//             description: task.description,
//             topicId: task.topic.id,
//             technologyIds: task.technologies.map(t => t.id)
//         }
//         await this._api.post<response.Task>("/api/tasks", requestBody)
//         await this.reloadDatabase()
//     }

//     @transaction
//     async updateTask(task: domain.Task): Promise<void> {
//         if (!this._permissions.canUpdateTask)
//             throw this.permissionError()
//         const body = {
//             title: task.title,
//             description: task.description,
//             topicId: task.topic.id,
//             technologyIds: task.technologies.map(t => t.id)
//         }
//         await this._api.put<response.Task>(`/api/tasks/${task.id}`, body)
//         await this.reloadDatabase()
//     }

//     @transaction
//     async deleteTask(task: domain.Task): Promise<void> {
//         if (!this._permissions.canDeleteTask)
//             throw this.permissionError()
//         await this._api.delete(`/api/tasks/${task.id}`)
//         await this.reloadDatabase()
//     }

//     @transaction
//     async updatePreferences(preferences: domain.Preferences): Promise<void> {
//         await this._api.put(`/api/preferences/${preferences.id}`, { theme: preferences.darkMode ? "dark" : "light" })
//         await this.reloadDatabase()
//     }

//     @transaction
//     async createSolution(solution: domain.Solution): Promise<void> {
//         if (!this._permissions.canCreateSolution)
//             throw this.permissionError()
//         await this._api.post<response.Solution>("/api/solutions", {
//             repositoryName: solution.name,
//             taskId: solution.task.id,
//             technologyId: solution.technology!.id
//         })
//         await this.reloadDatabase()
//     }

//     @transaction
//     async deleteSolution(solution: domain.Solution): Promise<void> {
//         if (!this._permissions.canDeleteSolution)
//             throw this.permissionError()
//         await this._api.delete(`/api/solutions/${solution.id}`)
//         await this.reloadDatabase()
//     }

//     @transaction
//     async createVcsAccount(provider: domain.Provider): Promise<void> {
//         // check permissions
//         const modal = new VcsAccountRegisteringModal()
//         const url = await (await fetch("/api/oauth/authorization-url/github")).text() // TODO: better solution
//         await modal.registerAccount(url)
//         await this.reloadDatabase()
//     }

//     @transaction
//     async deleteVcsAccount(account: domain.Account): Promise<void> {
//         // check permissions
//         await this._api.delete(`/api/vcs-accounts/${account.id}`)
//         await this.reloadDatabase()
//     }

//     private permissionError(): Error {
//         return new Error("Permission error")
//     }

//     @transaction
//     private async reloadDatabase(): Promise<void> {
//         const responses = await Promise.all([
//             this._api.get<response.Topic[]>("/api/topics"),
//             this._api.get<response.Task[]>("/api/tasks"),
//             this._api.get<response.Preferences>("/api/preferences/1"),
//             this._api.get<response.Permissions>("/api/permissions/author"),
//             this._api.get<response.Technology[]>("/api/technologies"),
//             this._api.get<response.VcsHostingProvider[]>("/api/vcs-hosting-providers"),
//             this._api.get<response.VcsAccount[]>("/api/vcs-accounts"),
//             this._api.get<response.Solution[]>("/api/solutions")
//         ])
//         const technologies = new Map<number, domain.Technology>()
//         for (const { id, name } of responses[4]) {
//             const technology = new domain.Technology(id, name)
//             technologies.set(technology.id, technology)
//         }
//         this._technologies = technologies
//         const topics = new Map<number, domain.Topic>()
//         for (const { id, name } of responses[0]) {
//             const topic = new domain.Topic(id, name)
//             topics.set(topic.id, topic)
//         }
//         for (const { id, description, title, topicId, technologyIds } of responses[1]) {
//             const topic = topics.get(topicId)
//             if (topic) { // ignore tasks without topics for now
//                 const solutions = []
//                 const task = new domain.Task(id, topic, title, description, technologyIds.map(id => technologies.get(id)!))
//                 for (const { id: solutionId, taskId, repositoryName, technologyId } of responses[7]) {
//                     if (id === taskId)
//                         solutions.push(new domain.Solution(solutionId, task, repositoryName, technologies.get(technologyId)!))
//                 }
//                 task.solutions = solutions
//                 topic.tasks.push(task)
//             }
//         }
//         this._topics = topics
//         this._preferences = new domain.Preferences(responses[2].id, responses[2].theme === "dark")
//         this._permissions = new domain.Permissions(responses[3].id, responses[3].canCreateTask, responses[3].canUpdateTask,
//             responses[3].canDeleteTask, responses[3].canUpdateVcsConfiguration, responses[3].canUpdateUser,
//             responses[3].canCreateSolution, responses[3].canDeleteSolution)
//         const providers = new Map<string, domain.Provider>()
//         for (const { id, name } of responses[5]) {
//             const provider = new domain.Provider(id, name, githubIcon)
//             providers.set(provider.id, provider)
//         }
//         const accounts = []
//         for (const { id, name, hostingProviderId } of responses[6]) {
//             const provider = providers.get(hostingProviderId)
//             if (provider) {
//                 const account = new domain.Account(id, provider, name)
//                 accounts.push(account)
//             }
//         }
//         this._vcsConfiguration = new domain.VcsConfiguration(Array.from(providers.values()), accounts, null)
//     }

//     @reaction
//     private async data_fetched_from_api(): Promise<void> {
//         await this.reloadDatabase()
//     }
// }
