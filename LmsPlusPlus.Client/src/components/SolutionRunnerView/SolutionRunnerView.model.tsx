import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr"
import React from "react"
import { cached, Monitor, options, reaction, transaction, Transaction, isnonreactive, Reentrance } from "reactronic"
import * as domain from "../../domain"
import { ServiceViewsExplorer } from "../ServicesViewExplorer"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import { IServiceWorkerService } from "./IServiceWorkerService"
import { ServiceView } from "./ServiceView.model"
import { SolutionRunnerMainPanelContent, SolutionRunnerSidePanelContent } from "./SolutionRunnerView.view"
import serviceWorkerUrl from "../../../service-worker?url"
import { IMessageService } from "../MessageService"
import { AppError } from "../../AppError"

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
    private _serviceViewsExplorer: ServiceViewsExplorer | null = null
    private _connection: HubConnection | null = null
    private _serviceViews: ServiceView[] | null = null
    private _serviceWorkerRegistration: ServiceWorkerRegistration | null = null

    override get title(): string { return "Run Solution" }
    override get shouldShowLoader(): boolean { return SolutionRunnerView._monitor.isActive }

    constructor(solution: domain.Solution, viewGroup: ViewGroup, errorsService: IMessageService) {
        super()
        this._solution = solution
        this._viewGroup = viewGroup
        this._messageService = errorsService
    }

    override dispose(): void {
        return Transaction.run(null, () => {
            this._serviceViewsExplorer?.dispose()
            this._serviceViews?.forEach(s => s.dispose())
            this._connection?.stop()
            super.dispose()
            Transaction.off(() => this._serviceWorkerRegistration?.unregister())
        })
    }

    @transaction
    @options({ reentrance: Reentrance.WaitAndRestart })
    async startServiceWorker(): Promise<ServiceWorker | null> {
        if (this._serviceWorkerRegistration) {
            this._messageService.showError(new AppError("Cannot start solution.", "Currently only one web view per solution is supported."))
            return null
        } else if (navigator.serviceWorker) {
            this._serviceWorkerRegistration = await navigator.serviceWorker.register(serviceWorkerUrl, { type: "module" })
            const { waiting, installing, active } = this._serviceWorkerRegistration
            const worker = waiting || installing || active
            return await new Promise<ServiceWorker>(resolve => {
                worker?.addEventListener("statechange", ({ target }) => {
                    const worker = target as ServiceWorker
                    if (worker.state === "activated")
                        resolve(worker)
                })
            })
        } else {
            this._messageService.showError(new AppError("Cannot start solution.", "Service workers are not supported in this browser."))
            return null
        }
    }

    @cached
    override renderSidePanelContent(): JSX.Element {
        return <SolutionRunnerSidePanelContent model={this} serviceViewsExplorer={this._serviceViewsExplorer} />
    }

    @cached
    override renderMainPanelContent(): JSX.Element {
        const currentRenderer = this._serviceViewsExplorer?.selectedNode?.item ?? null
        const renderers = this._serviceViews?.flatMap(v => v.renderers) ?? null
        return <SolutionRunnerMainPanelContent renderers={renderers} currentRenderer={currentRenderer} />
    }

    stopSolution(): void {
        this._viewGroup.returnToPreviousView()
    }

    @reaction
    @options({ monitor: SolutionRunnerView._monitor })
    private async startSolution(): Promise<void> {
        this._connection = new HubConnectionBuilder().withUrl("/api/application").build()
        await this._connection.start()
        const serviceConfigurations = await this._connection.invoke<ServiceConfiguration[]>("StartApplication", this._solution.id)
        this._serviceViews = serviceConfigurations.map(c => new ServiceView(c.name, c.stdin, c.virtualPorts, this._connection!, this,
            this._messageService))
        if (this._serviceViews.length === 0)
            this._messageService.showError(new AppError("Cannot start solution.", "There are no services in solution."))
        else
            this._serviceViewsExplorer = new ServiceViewsExplorer(this._serviceViews)
    }
}
