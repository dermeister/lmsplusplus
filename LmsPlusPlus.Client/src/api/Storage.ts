import { Axios, AxiosError, AxiosResponse } from "axios"
import { isnonreactive, Monitor, options, reaction, transaction, Transaction } from "reactronic"
import { AppError } from "../AppError"
import githubIcon from "../assets/github.svg"
import * as domain from "../domain"
import { ObservableObject } from "../ObservableObject"
import { IMessageService } from "../ui/MessageService"
import { handleError } from "../ui/utils"
import { IAuthService } from "./AuthService"
import * as request from "./request"
import * as response from "./response"
import { VcsAccountRegisteringModal } from "./VcsAccountRegisteringModal"

export class Storage extends ObservableObject {
    @isnonreactive private static readonly _monitor = Monitor.create("storage", 0, 0, 0)
    @isnonreactive private readonly _api: Axios
    @isnonreactive private readonly _messageService: IMessageService
    @isnonreactive private readonly _authService: IAuthService
    private _topics: domain.Topic[] = []
    private _preferences = domain.Preferences.default
    private _user = domain.User.default
    private _permissions = domain.Permissions.default
    private _technologies: readonly domain.Technology[] = []
    private _accounts: domain.Account[] = []
    private _providers: domain.Provider[] = []

    get topics(): readonly domain.Topic[] { return this._topics }
    get technologies(): readonly domain.Technology[] { return this._technologies }
    get preferences(): domain.Preferences { return this._preferences }
    get user(): domain.User { return this._user }
    get permissions(): domain.Permissions { return this._permissions }
    get accounts(): readonly domain.Account[] { return this._accounts }
    get providers(): readonly domain.Provider[] { return this._providers }
    get isLoadingData(): boolean { return Storage._monitor.isActive }

    constructor(api: Axios, messageService: IMessageService, authService: IAuthService) {
        super()
        this._api = api
        this._messageService = messageService
        this._authService = authService
    }

    @transaction
    async createTask(task: domain.Task): Promise<void> {
        if (!this._permissions.canCreateTask)
            throw this.permissionError()
        try {
            const { data } = await this._api.post<response.Task, AxiosResponse<response.Task>, request.CreateTask>("/api/tasks", {
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
                        throw new AppError("Cannot create task.", `Technology with id ${id} not found.`)
                    return technology
                })
                const newTask = new domain.Task(data.id, task.topic, data.title, data.description, technologies)
                newTopic.tasks = task.topic.tasks.concat(newTask)
                return newTopic
            })
        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.response?.status === 400) {
                    const problemDetails = e.response.data as response.ProblemDetails
                    throw new AppError(problemDetails.title, problemDetails.detail)
                } else if (e.response?.status === 401) {
                    this._authService.signOut()
                    this._messageService.showError(new AppError("Cannot create task.", "Your session expired."))
                } else
                    throw e
            } else
                throw e
        }
    }

    @transaction
    async updateTask(task: domain.Task): Promise<void> {
        if (!this._permissions.canUpdateTask)
            throw this.permissionError()
        try {
            const { data } = await this._api.put<response.Task, AxiosResponse<response.Task>, request.UpdateTask>(`/api/tasks/${task.id}`, {
                title: task.title,
                description: task.description,
                technologyIds: task.technologies.map(t => t.id)
            })
            this._topics = this._topics.map(t => {
                if (t.id !== task.topic.id)
                    return t
                const newTopic = new domain.Topic(task.topic.id, task.topic.name)
                const technologies = data.technologyIds.map(id => {
                    const technology = this._technologies.find(t => t.id === id)
                    if (!technology)
                        throw new AppError("Cannot update task.", `Technology with id ${id} not found.`)
                    return technology
                })
                const newTask = new domain.Task(data.id, task.topic, data.title, data.description, technologies)
                newTopic.tasks = task.topic.tasks.map(t => {
                    if (t.id !== task.id)
                        return t
                    return newTask
                })
                return newTopic
            })
        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.response?.status === 400) {
                    const problemDetails = e.response.data as response.ProblemDetails
                    throw new AppError(problemDetails.title, problemDetails.detail)
                } else if (e.response?.status === 401) {
                    this._authService.signOut()
                    this._messageService.showError(new AppError("Cannot update task.", "Your session expired."))
                } else
                    throw e
            } else
                throw e
        }
    }

    @transaction
    async deleteTask(task: domain.Task): Promise<void> {
        if (!this._permissions.canDeleteTask)
            throw this.permissionError()
        try {
            await this._api.delete(`/api/tasks/${task.id}`)
            this._topics = this._topics.map(t => {
                if (t.id !== task.topic.id)
                    return t
                const newTopic = new domain.Topic(t.id, t.name)
                newTopic.tasks = t.tasks.filter(t => t.id !== task.id)
                return newTopic
            })
        } catch (e) {
            if (e instanceof AxiosError && e.response?.status === 401) {
                this._authService.signOut()
                this._messageService.showError(new AppError("Cannot delete task.", "Your session expired."))
            } else
                throw e
        }
    }

    @transaction
    async updatePreferences(preferences: domain.Preferences): Promise<void> {
        try {
            const { data } = await this._api.put<response.Preferences, AxiosResponse<response.Preferences>, request.Preferences>("/api/preferences", {
                theme: preferences.theme
            })
            this._preferences = new domain.Preferences(data.theme)
        } catch (e) {
            if (e instanceof AxiosError && e.response?.status === 401) {
                this._authService.signOut()
                this._messageService.showError(new AppError("Cannot update preferences.", "Your session expired."))
            } else
                throw e
        }
    }

    @transaction
    async addAccount(provider: domain.Provider): Promise<void> {
        const vcsAccountRegisteringModal = new VcsAccountRegisteringModal()
        try {
            const { data: authorizationUrl } = await this._api.get<string>(`/api/oauth/authorization-url/${provider.id}`)
            await vcsAccountRegisteringModal.registerAccount(authorizationUrl)
        } catch (e) {
            if (e instanceof AxiosError && e.response?.status === 401) {
                this._authService.signOut()
                this._messageService.showError(new AppError("Cannot add account.", "Your session expired."))
            } else
                throw e
        }
        try {
            this._accounts = await this.fetchVcsAccounts(this._providers)
        } catch (e) {
            if (e instanceof AxiosError && e.response?.status === 401) {
                this._authService.signOut()
                this._messageService.showError(new AppError("Cannot refresh account list.", "Your session expired."))
            } else
                throw e
        }
    }

    @transaction
    async deleteAccount(account: domain.Account): Promise<void> {
        if (!this._permissions.canUpdateVcsConfiguration)
            throw this.permissionError()
        try {

            await this._api.delete(`/api/vcs-accounts/${account.id}`)
        } catch (e) {
            if (e instanceof AxiosError && e.response?.status === 401) {
                this._authService.signOut()
                this._messageService.showError(new AppError("Cannot delete task.", "Your session expired."))
            } else
                throw e
        }
        this._accounts = this._accounts.filter(a => a.id !== account.id)
    }

    @transaction
    async setActiveAccount(account: domain.Account): Promise<void> {
        if (!this._permissions.canUpdateVcsConfiguration)
            throw this.permissionError()
        try {
            const { data } = await this._api.put<response.VcsAccount, AxiosResponse<response.VcsAccount>, request.VcsAccount>(
                `/api/vcs-accounts/${account.id}`, { isActive: true })
            if (data.isActive)
                this._accounts = this._accounts.map(a => {
                    if (a.isActive)
                        return new domain.Account(a.id, a.provider, a.name, false)
                    if (a.id !== account.id)
                        return a
                    return new domain.Account(a.id, a.provider, a.name, true)
                })

        } catch (e) {
            if (e instanceof AxiosError && e.response?.status === 401) {
                this._authService.signOut()
                this._messageService.showError(new AppError("Cannot set active account.", "Your session expired."))
            } else
                throw e
        }
    }

    @transaction
    async createSolution(solution: domain.Solution, technology: domain.Technology): Promise<void> {
        if (!this._permissions.canCreateSolution)
            throw this.permissionError()
        try {
            const { data } = await this._api.post<response.Solution, AxiosResponse<response.Solution>, request.Solution>("/api/solutions", {
                repositoryName: solution.repositoryName as string,
                taskId: solution.task.id,
                technologyId: technology.id
            })
            this._topics = this._topics.map(topic => {
                if (topic.id !== solution.task.topic.id)
                    return topic
                const newTopic = new domain.Topic(topic.id, topic.name)
                newTopic.tasks = topic.tasks.map(task => {
                    if (task.id !== solution.task.id)
                        return task
                    const newTask = new domain.Task(solution.task.id, newTopic, solution.task.title, solution.task.description,
                        solution.task.technologies)
                    const newSolution = new domain.Solution(data.id, newTask, null, data.cloneUrl, data.websiteUrl)
                    newTask.solutions = task.solutions.concat(newSolution)
                    return newTask
                })
                return newTopic
            })
        } catch (e) {
            if (e instanceof AxiosError) {
                if (e.response?.status === 400) {
                    const problemDetails = e.response.data as response.ProblemDetails
                    throw new AppError(problemDetails.title, problemDetails.detail)
                } else if (e.response?.status === 401) {
                    this._authService.signOut()
                    this._messageService.showError(new AppError("Cannot create solution.", "Your session expired."))
                } else
                    throw e
            }
            throw e
        }
    }

    @transaction
    async deleteSolution(solution: domain.Solution): Promise<void> {
        if (!this._permissions.canDeleteSolution)
            throw this.permissionError()
        try {
            await this._api.delete(`/api/solutions/${solution.id}`)
            this._topics = this._topics.map(topic => {
                if (topic.id !== solution.task.topic.id)
                    return topic
                const newTopic = new domain.Topic(topic.id, topic.name)
                newTopic.tasks = topic.tasks.map(task => {
                    if (task.id !== solution.task.id)
                        return task
                    const newTask = new domain.Task(task.id, newTopic, task.title, task.description, task.technologies)
                    newTask.solutions = task.solutions.filter(s => s.id !== solution.id)
                    return newTask
                })
                return newTopic
            })
        } catch (e) {
            if (e instanceof AxiosError && e.response?.status === 401) {
                this._authService.signOut()
                this._messageService.showError(new AppError("Cannot delete solution.", "Your session expired."))
            } else
                throw e
        }
    }

    @transaction
    private permissionError(): AppError {
        return new AppError("Permission denied.", "You don't have permission to perform this action.")
    }

    @reaction
    @options({ monitor: Storage._monitor })
    private async fetchData(): Promise<void> {
        try {
            const user = this.fetchUser()
            const preferences = this.fetchPreferences()
            const permissions = this.fetchPermissions()
            const technologies = this.fetchTechnologies()
            const topics = this.fetchTopics()
            await Promise.all([user, preferences, permissions, technologies, topics])
            if ((await permissions).canUpdateVcsConfiguration) {
                const providers = await this.fetchVcsHostingProviders()
                this._providers = providers
                const accounts = await this.fetchVcsAccounts(providers)
                this._accounts = accounts
            }
            const tasks = await this.fetchTasks(await topics, await technologies)
            const solutions = await this.fetchSolutions(tasks)
            for (const topic of await topics) {
                topic.tasks = tasks.filter(t => t.topic.id === topic.id)
                for (const task of topic.tasks)
                    task.solutions = solutions.filter(s => s.task.id === task.id)
            }
            this._user = await user
            this._preferences = await preferences
            this._permissions = await permissions
            this._technologies = await technologies
            this._topics = await topics
        } catch (e) {
            if (e instanceof AxiosError && e.response?.status === 401) {
                this._authService.signOut()
                this._messageService.showError(new AppError("Cannot fetch data.", "Your session expired."))
            } else
                Transaction.off(() => handleError(e, this._messageService))
        }
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
        const { data } = await this._api.get<response.Permissions>("/api/permissions")
        return new domain.Permissions(data.canCreateTask, data.canUpdateTask, data.canDeleteTask, data.canUpdateVcsConfiguration,
            data.canUpdateUser, data.canCreateSolution, data.canDeleteSolution)
    }

    private async fetchVcsHostingProviders(): Promise<domain.Provider[]> {
        const { data } = await this._api.get<response.VcsHostingProvider[]>("/api/vcs-hosting-providers")
        return data.map(p => new domain.Provider(p.id, p.name, githubIcon))
    }

    private async fetchVcsAccounts(providers: domain.Provider[]): Promise<domain.Account[]> {
        const { data } = await this._api.get<response.VcsAccount[]>("/api/vcs-accounts")
        return data.map(a => {
            const provider = providers.find(p => p.id === a.hostingProviderId)
            if (!provider)
                throw new AppError("Cannot fetch accounts.", `Provider with id ${a.hostingProviderId} not found.`)
            return new domain.Account(a.id, provider, a.name, a.isActive)
        })
    }

    private async fetchTechnologies(): Promise<domain.Technology[]> {
        const { data } = await this._api.get<response.Technology[]>("/api/technologies")
        return data.map(t => new domain.Technology(t.id, t.name))
    }

    private async fetchTopics(): Promise<domain.Topic[]> {
        const { data } = await this._api.get<response.Topic[]>("/api/topics")
        return data.map(t => new domain.Topic(t.id, t.name))
    }

    private async fetchTasks(topics: domain.Topic[], allTechnologies: domain.Technology[]): Promise<domain.Task[]> {
        const { data } = await this._api.get<response.Task[]>("/api/tasks")
        return data.map(t => {
            const topic = topics.find(topic => topic.id === t.topicId)
            if (!topic)
                throw new AppError("Cannot fetch tasks.", `Topic with id ${t.topicId} not found.`)
            const taskTechnologies = t.technologyIds.map(id => {
                const technology = allTechnologies.find(technology => technology.id === id)
                if (!technology)
                    throw new AppError("Cannot fetch tasks.", `Technology with id ${id} not found.`)
                return technology
            })
            const task = new domain.Task(t.id, topic, t.title, t.description, taskTechnologies)
            return task
        })
    }

    private async fetchSolutions(tasks: domain.Task[]): Promise<domain.Solution[]> {
        const { data } = await this._api.get<response.Solution[]>("/api/solutions")
        return data.map(s => {
            const task = tasks.find(t => t.id === s.taskId)
            if (!task)
                throw new AppError("Cannot fetch solutions.", `Task with id ${s.taskId} not found.`)
            return new domain.Solution(s.id, task, null, s.cloneUrl, s.websiteUrl)
        })
    }
}
