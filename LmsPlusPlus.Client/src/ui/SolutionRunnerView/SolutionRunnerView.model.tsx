import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr"
import React from "react"
import { cached, isnonreactive, Monitor, options, reaction, Reentrance, transaction, Transaction } from "reactronic"
import serviceWorkerUrl from "../../../service-worker?url"
import { AppError } from "../../AppError"
import * as domain from "../../domain"
import { IMessageService } from "../MessageService"
import { ServiceViewsExplorer } from "../ServicesViewExplorer"
import { IThemeService } from "../ThemeService"
import { handleError } from "../utils"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import { IRenderer } from "./IRenderer"
import { IServiceWorkerService } from "./IServiceWorkerService"
import { ServiceView } from "./ServiceView.model"
import { SolutionRunnerMainPanelContent, SolutionRunnerSidePanelContent } from "./SolutionRunnerView.view"

interface ServiceConfiguration {
    name: string
    stdin: boolean
    virtualPorts: readonly number[]
}

export class SolutionRunnerView extends View implements IServiceWorkerService {
    @isnonreactive private static readonly _monitor = Monitor.create("solution-runner", 0, 0, 0)
    @isnonreactive private readonly _solution: domain.Solution
    @isnonreactive private readonly _viewGroup: ViewGroup
    @isnonreactive private readonly _messageService: IMessageService
    @isnonreactive private readonly _themeService: IThemeService
    private _serviceViewsExplorer: ServiceViewsExplorer | null = null
    private _connection: HubConnection | null = null
    private _serviceViews: ServiceView[] | null = null
    private _serviceWorkerRegistration: ServiceWorkerRegistration | null = null
    private _unableToStartApplication = false

    override get title(): string { return "Run Solution" }
    override get shouldShowLoader(): boolean { return SolutionRunnerView._monitor.isActive }
    get serviceViewsExplorer(): ServiceViewsExplorer | null { return this._serviceViewsExplorer }
    get renderers(): readonly IRenderer[] | null { return this._serviceViews?.flatMap(s => s.renderers) ?? null }
    get currentRenderer(): IRenderer | null { return this._serviceViewsExplorer?.selectedNode?.item ?? null }
    get unableToStartApplication(): boolean { return this._unableToStartApplication }

    constructor(solution: domain.Solution, viewGroup: ViewGroup, errorsService: IMessageService, themeService: IThemeService) {
        super()
        this._solution = solution
        this._viewGroup = viewGroup
        this._messageService = errorsService
        this._themeService = themeService
    }

    override dispose(): void {
        Transaction.run(null, () => {
            this._serviceViewsExplorer?.dispose()
            this._serviceViews?.forEach(s => s.dispose())
            this._connection?.stop()
            super.dispose()
            Transaction.off(() => this._serviceWorkerRegistration?.unregister())
        })
    }

    @transaction
    @options({ reentrance: Reentrance.WaitAndRestart })
    async startServiceWorker(): Promise<ServiceWorker> {
        if (this._serviceWorkerRegistration)
            throw new AppError("Cannot start solution.", "Currently only one web view per solution is supported.")
        if (!navigator.serviceWorker)
            throw new AppError("Cannot start solution.", "Service workers are not supported in this browser.")
        this._serviceWorkerRegistration = await navigator.serviceWorker.register(serviceWorkerUrl, { type: "module" })
        const { waiting, installing, active } = this._serviceWorkerRegistration
        const worker = waiting || installing || active
        if (!worker)
            throw new AppError("Cannot start solution.", "Service worker is not available.")
        return await new Promise<ServiceWorker>(resolve => worker.addEventListener("statechange", ({ target }) => {
            const worker = target as ServiceWorker
            if (worker.state === "activated")
                resolve(worker)
        }))
    }

    @cached
    override renderSidePanelContent(): JSX.Element {
        return <SolutionRunnerSidePanelContent view={this} />
    }

    @cached
    override renderMainPanelContent(): JSX.Element {
        return <SolutionRunnerMainPanelContent view={this} />
    }

    async close(): Promise<void> {
        this._viewGroup.returnToPreviousView()
    }

    @reaction
    @options({ monitor: SolutionRunnerView._monitor })
    private async startSolution(): Promise<void> {
        try {
            this._connection = new HubConnectionBuilder().withUrl("/application").build()
            await this._connection.start()
            const serviceConfigurations = await this._connection.invoke<ServiceConfiguration[]>("StartApplication", this._solution.id)
            this._serviceViews = serviceConfigurations.map(c => new ServiceView(c.name, c.stdin, c.virtualPorts, this._connection!, this,
                this._messageService, this._themeService))
            if (this._serviceViews.length === 0)
                this._messageService.showError(new AppError("Cannot start solution.", "There are no services in solution."))
            else
                this._serviceViewsExplorer = new ServiceViewsExplorer(this._serviceViews)
        } catch (e) {
            this._unableToStartApplication = true
            e = new AppError("Cannot start solution.", "Something went wrong while starting application.")
            Transaction.off(() => handleError(e, this._messageService))
        }
    }
}
