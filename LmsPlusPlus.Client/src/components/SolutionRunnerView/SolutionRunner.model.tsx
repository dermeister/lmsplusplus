import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr"
import React from "react"
import { cached, Monitor, options, reaction, Transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import { ServicesExplorer } from "../ServicesExplorer/ServicesExplorer"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import { ServiceView } from "./ServiceView.model"
import { SolutionRunnerMainPanelContent, SolutionRunnerSidePanelContent } from "./SolutionRunnerView"

interface ServiceConfiguration {
    name: string
    stdin: boolean
    virtualPorts: readonly number[]
}

interface PortMapping {
    port: number
    virtualPort: number
}

export class SolutionRunnerView extends View {
    private static readonly _monitor = Monitor.create("solution-runner", 0, 0)
    @unobservable private readonly _solution: domain.Solution
    @unobservable private readonly _viewGroup: ViewGroup
    private _servicesExplorer: ServicesExplorer | null = null
    private _connection: HubConnection | null = null
    private _services: ServiceView[] | null = null
    private _currentService: ServiceView | null = null
    // private _serviceView: ServiceView | null = null
    // private _serviceWorkerRegistration: ServiceWorkerRegistration | null = null
    // private _areServicePortsBeingOpened = false

    override get title(): string { return "Run Solution" }
    override get shouldShowLoader(): boolean { return SolutionRunnerView._monitor.isActive }
    get servicesExplorer(): ServicesExplorer | null { return this._servicesExplorer }
    // get isLoadingApplication(): boolean { return SolutionRunner.s_monitor.isActive
    // get serviceView(): ServiceView | null { return this._serviceView }

    constructor(solution: domain.Solution, viewGroup: ViewGroup) {
        super()
        this._solution = solution
        this._viewGroup = viewGroup
    }

    override dispose(): void {
        return Transaction.run(() => {
            this._services?.forEach(s => s.dispose())
            this._connection?.stop()
            super.dispose()
            //         this._servicesExplorer?.dispose()
            //         this._services?.forEach(s => s.dispose())
            //         return this._serviceWorkerRegistration?.unregister().then() ?? Promise.resolve()
        })
    }

    @cached
    override renderSidePanelContent(): JSX.Element {
        return <SolutionRunnerSidePanelContent model={this} />
    }

    @cached
    override renderMainPanelContent(): JSX.Element {
        return <SolutionRunnerMainPanelContent currentService={this._currentService} services={this._services} />
    }

    stopSolution(): void {
        this._connection?.stop()
        this._viewGroup.returnToPreviousView()
    }


    @reaction
    @options({ monitor: SolutionRunnerView._monitor })
    private async startSolution(): Promise<void> {
        this._connection = new HubConnectionBuilder().withUrl("/api/application").build()
        await this._connection.start()
        const serviceConfigurations = await this._connection.invoke<ServiceConfiguration[]>("StartApplication", this._solution.id)
        this._services = serviceConfigurations.map(c => new ServiceView(c.name, c.stdin, c.virtualPorts, this._connection!))
        if (this._services.length > 0) {
            this._currentService = this._services[0]
        } else
            throw new Error("There are no services in solution.")
    }

    @reaction @options({ monitor: SolutionRunnerView._monitor })
    private async createServicesExplorer(): Promise<void> {
        // this._connection = new HubConnectionBuilder().withUrl("/api/application").build()
        // await this._connection.start()
        // const configurations = await this._connection.invoke<ServiceConfiguration[]>("StartApplication", this._solution.id)
        // this._areServicePortsBeingOpened = configurations.some(c => c.virtualPorts.length > 0)
        // this._services = configurations.map(c =>
        //     new Service(c.name, c.stdin, c.virtualPorts, new Ref(this, "_areServicePortsBeingOpened"), this._connection!))
        // this._servicesExplorer = new ServicesExplorer(new Ref(this, "_services"))
        // this._servicesExplorer.setSelectedNode(this._servicesExplorer.children[0])
    }

    @reaction
    private updateServiceView(): void {
        // if (this._servicesExplorer?.selectedNode)
        //     this._serviceView = this._servicesExplorer.selectedNode.item.serviceView
    }

    @reaction
    private async getOpenedPorts(): Promise<void> {
        // if (this._areServicePortsBeingOpened) {
        //     const portMappingsPromises =
        //         this._services!.map(s => this._connection!.invoke<PortMapping[]>("GetOpenedPorts", s.name))
        //     const portMappings = (await Promise.all(portMappingsPromises)).flat()
        //     if (navigator.serviceWorker) {
        //         this._serviceWorkerRegistration = await navigator.serviceWorker.register(serviceWorkerUrl, { type: "module" })
        //         const { waiting, installing, active } = this._serviceWorkerRegistration
        //         const worker = waiting || installing || active
        //         worker?.addEventListener("statechange", ({ target }) => {
        //             const worker = target as ServiceWorker
        //             if (worker.state === "activated") {
        //                 worker.postMessage(JSON.stringify(portMappings))
        //                 Transaction.run(() => this._areServicePortsBeingOpened = false)
        //             }
        //         })
        //     }
        // }
    }
}
