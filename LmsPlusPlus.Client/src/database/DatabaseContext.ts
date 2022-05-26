import { Axios, AxiosResponse } from "axios"
import { reaction, transaction, unobservable } from "reactronic"
import githubIcon from "../assets/github.svg"
import * as domain from "../domain"
import { ObservableObject } from "../ObservableObject"

export class DatabaseContext extends ObservableObject {
    @unobservable private readonly _api: Axios
    private _topics: domain.Topic[] = []
    private _vcsConfiguration = domain.VcsConfiguration.default
    private _preferences = domain.Preferences.default
    private _user = domain.User.default
    private _permissions = domain.Permissions.default
    private _technologies: readonly domain.Technology[] = []
    private _accounts: domain.Account[] = []
    private _providers: domain.Provider[] = []

    get courses(): readonly domain.Topic[] { return this._topics }
    get technologies(): readonly domain.Technology[] { return this._technologies }
    get vcsConfiguration(): domain.VcsConfiguration { return this._vcsConfiguration }
    get preferences(): domain.Preferences { return this._preferences }
    get user(): domain.User { return this._user }
    get permissions(): domain.Permissions { return this._permissions }
    get accounts(): readonly domain.Account[] { return this._accounts }
    get providers(): readonly domain.Provider[] { return this._providers }

    constructor(api: Axios) {
        super()
        this._api = api
    }

    @transaction
    async createTask(task: domain.Task): Promise<void> {
        if (!this._permissions.canCreateTask)
            throw this.permissionError()
        interface RequestTaskData {
            title: string
            description: string
            topicId: number
            technologyIds: number[]
        }
        interface ResponseTaskData {
            id: number
            title: string
            description: string
            topicId: number
            technologyIds: number[]
        }
        const { data } = await this._api.post<ResponseTaskData, AxiosResponse<ResponseTaskData>, RequestTaskData>("/api/tasks", {
            title: task.title,
            description: task.description,
            topicId: task.topic.id,
            technologyIds: task.technologies.map(t => t.id)
        })
        this._topics = this._topics.map(t => {
            if (t.id !== task.topic.id)
                return t
            const newTopic = new domain.Topic(task.topic.id, task.topic.name)
            const technologies = data.technologyIds.map(id => {
                const technology = this._technologies.find(t => t.id === id)
                if (!technology)
                    throw new Error(`Technology with id ${id} not found`)
                return technology
            })
            const newTask = new domain.Task(data.id, task.topic, data.title, data.description, technologies)
            newTopic.tasks = task.topic.tasks.concat(newTask)
            return newTopic
        })
    }

    @transaction
    async updateTask(task: domain.Task): Promise<void> {
        if (!this._permissions.canUpdateTask)
            throw this.permissionError()
        interface RequestTaskData {
            title: string
            description: string
            topicId: number
            technologyIds: number[]
        }
        interface ResponseTaskData {
            id: number
            title: string
            description: string
            topicId: number
            technologyIds: number[]
        }
        const { data } = await this._api.put<ResponseTaskData, AxiosResponse<ResponseTaskData>, RequestTaskData>(`/api/tasks/${task.id}`, {
            title: task.title,
            description: task.description,
            topicId: task.topic.id,
            technologyIds: task.technologies.map(t => t.id)
        })
        this._topics = this._topics.map(t => {
            if (t.id !== task.topic.id)
                return t
            const newTopic = new domain.Topic(task.topic.id, task.topic.name)
            const technologies = data.technologyIds.map(id => {
                const technology = this._technologies.find(t => t.id === id)
                if (!technology)
                    throw new Error(`Technology with id ${id} not found`)
                return technology
            })
            const newTask = new domain.Task(data.id, task.topic, data.title, data.description, technologies)
            newTopic.tasks = task.topic.tasks.concat(newTask)
            return newTopic
        })
    }

    @transaction
    async deleteTask(task: domain.Task): Promise<void> {
        if (!this._permissions.canDeleteTask)
            throw this.permissionError()
        await this._api.delete(`/api/tasks/${task.id}`)
        this._topics = this._topics.map(t => {
            if (t.id !== task.topic.id)
                return t
            const newTopic = new domain.Topic(t.id, t.name)
            newTopic.tasks = t.tasks.filter(t => t.id !== task.id)
            return newTopic
        })
    }

    @transaction
    async updatePreferences(preferences: domain.Preferences): Promise<void> {
        interface PreferencesData {
            theme: string
        }
        const { data } = await this._api.put<PreferencesData, AxiosResponse<PreferencesData>, PreferencesData>("/api/preferences", {
            theme: preferences.theme
        })
        this._preferences = new domain.Preferences(data.theme)
    }

    @transaction
    async deleteAccount(account: domain.Account): Promise<void> {
        if (!this._permissions.canUpdateVcsConfiguration)
            throw this.permissionError()
        await this._api.delete(`/api/vcs-accounts/${account.id}`)
        this._accounts = this._accounts.filter(a => a.id !== account.id)
    }

    @transaction
    async setActiveAccount(account: domain.Account): Promise<void> {
        if (!this._permissions.canUpdateVcsConfiguration)
            throw this.permissionError()
        interface AccountData {
            isActive: boolean
        }
        const { data } = await this._api.put<AccountData, AxiosResponse<AccountData>, AccountData>(`/api/vcs-accounts/${account.id}`, {
            isActive: true
        })
        if (data.isActive)
            this._accounts = this._accounts.map(a => {
                if (a.isActive)
                    return new domain.Account(a.id, a.provider, a.username, false)
                if (a.id !== account.id)
                    return a
                return new domain.Account(a.id, a.provider, a.username, true)
            })
    }

    @transaction
    async createSolution(solution: domain.Solution): Promise<void> {
        if (!this._permissions.canCreateSolution)
            throw this.permissionError()

        await new Promise(r => setTimeout(r, 1000))

        solution = new domain.Solution(1, solution.task, solution.name, solution.technology)
        const courses = this._topics.toMutable()
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
        this._topics = courses
    }

    @transaction
    async deleteSolution(solution: domain.Solution): Promise<void> {
        if (!this._permissions.canDeleteSolution)
            throw this.permissionError()

        await new Promise(r => setTimeout(r, 1000))

        const courses = this._topics.toMutable()
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
        this._topics = courses
    }

    @transaction
    private permissionError(): Error {
        return new Error("Permission error")
    }

    @reaction
    private async fetchDataFromApi(): Promise<void> {
        this._user = await this.fetchUser()
        this._preferences = await this.fetchPreferences()
        const permissions = await this.fetchPermissions()
        this._permissions = permissions
        if (permissions.canUpdateVcsConfiguration) {
            const providers = await this.fetchVcsHostingProviders()
            const accounts = await this.fetchVcsAccounts(providers)
            this._vcsConfiguration = new domain.VcsConfiguration(Array.from(providers.values()), accounts)
        }
        const technologies = await this.fetchTechnologies()
        this._technologies = Array.from(technologies.values())
        const topics = await this.fetchTopics()
        const tasks = await this.fetchTasks(topics, technologies)
        for (const topic of topics.values()) {
            const topicTasks = Array.from(tasks.values()).filter(t => t.topic.id === topic.id)
            topic.tasks = topicTasks
        }
        this._topics = topics
    }

    private async fetchUser(): Promise<domain.User> {
        const { data } = await this._api.get<{ firstName: string, lastName: string }>("/api/users")
        return new domain.User(data.firstName, data.lastName)
    }

    private async fetchPreferences(): Promise<domain.Preferences> {
        const { data } = await this._api.get<{ theme: string }>("/api/preferences")
        return new domain.Preferences(data.theme)
    }

    private async fetchPermissions(): Promise<domain.Permissions> {
        interface PermissionsData {
            canCreateTask: boolean
            canUpdateTask: boolean
            canDeleteTask: boolean
            canUpdateVcsConfiguration: boolean
            canUpdateUser: boolean
            canCreateSolution: boolean
            canDeleteSolution: boolean
        }
        const { data } = await this._api.get<PermissionsData>("/api/permissions")
        return new domain.Permissions(data.canCreateTask, data.canUpdateTask, data.canDeleteTask, data.canUpdateVcsConfiguration, data.canUpdateUser,
            data.canCreateSolution, data.canDeleteSolution)
    }

    private async fetchVcsHostingProviders(): Promise<domain.Provider[]> {
        interface VcsHostingProviderData {
            id: string
            name: string
        }
        const { data } = await this._api.get<VcsHostingProviderData[]>("/api/vcs-hosting-providers")
        return data.map(p => new domain.Provider(p.id, p.name, githubIcon))
    }

    private async fetchVcsAccounts(providers: domain.Provider[]): Promise<domain.Account[]> {
        interface VcsAccountData {
            id: number
            providerId: string
            username: string
            isActive: boolean
        }
        const { data } = await this._api.get<VcsAccountData[]>("/api/vcs-accounts")
        return data.map(a => {
            const provider = providers.find(p => p.id === a.providerId)
            if (!provider)
                throw new Error(`Unknown provider with id ${a.providerId}.`)
            return new domain.Account(a.id, provider, a.username, a.isActive)
        })
    }

    private async fetchTechnologies(): Promise<Map<number, domain.Technology>> {
        interface TechnologyData {
            id: number
            name: string
        }
        const { data } = await this._api.get<TechnologyData[]>("/api/technologies")
        return new Map(data.map(t => [t.id, new domain.Technology(t.id, t.name)]))
    }

    private async fetchTopics(): Promise<domain.Topic[]> {
        interface TopicData {
            id: number
            name: string
        }
        const { data } = await this._api.get<TopicData[]>("/api/topics")
        return data.map(t => new domain.Topic(t.id, t.name))
    }

    private async fetchTasks(topics: domain.Topic[], allTechnologies: Map<number, domain.Technology>): Promise<domain.Task[]> {
        interface TaskData {
            id: number
            topicId: number
            title: string
            description: string
            technologyIds: number[]
        }
        const { data } = await this._api.get<TaskData[]>("/api/tasks")
        return data.map(t => {
            const topic = topics.find(topic => topic.id === t.topicId)
            if (!topic)
                throw new Error(`Unknown topic with id ${t.topicId}.`)
            const taskTechnologies = t.technologyIds.map(id => {
                const technology = allTechnologies.get(id)
                if (!technology)
                    throw new Error(`Unknown technology with id ${id}.`)
                return technology
            })
            const task = new domain.Task(t.id, topic, t.title, t.description, taskTechnologies)
            return task
        })
    }
}
