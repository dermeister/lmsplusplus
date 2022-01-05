import { ObservableObject } from "../../ObservableObject"
import * as domain from "../../domain"
import { Monitor, options, reaction, Ref, Transaction, transaction, unobservable } from "reactronic"
import { Service } from "./service/Service"
import { ServicesExplorer } from "./ServicesExplorer"
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr"

export class SolutionRunner extends ObservableObject {
    private static readonly s_monitor = Monitor.create("solution-runner", 0, 0)
    @unobservable private readonly _solution: domain.Solution
    private _servicesExplorer: ServicesExplorer | null = null
    private _connection: HubConnection | null = null
    private _services: readonly Service[] | null = null
    private _renderedService: Service | null = null
    private _container: HTMLElement | null = null

    get servicesExplorer(): ServicesExplorer | null { return this._servicesExplorer }
    get isLoadingApplication(): boolean { return SolutionRunner.s_monitor.isActive }

    constructor(solution: domain.Solution) {
        super()
        this._solution = solution
    }

    override dispose(): void {
        Transaction.run(() => {
            this._servicesExplorer?.dispose()
            this._services?.forEach(s => s.dispose())
            this._connection?.stop()
            super.dispose()
        })
    }

    @transaction
    mountApplication(container: HTMLElement): void {
        this._container = container
    }

    @transaction
    unmountApplication(): void {
        this._container = null
    }

    @reaction @options({ monitor: SolutionRunner.s_monitor })
    private async createServicesExplorer(): Promise<void> {
        this._connection = new HubConnectionBuilder().withUrl("/api/application").build()
        await this._connection.start()
        const configurations = await this._connection.invoke<ServiceConfiguration[]>("StartApplication", 1)
        this._services = configurations.map(c => new Service(c.name, c.stdin, c.virtualPorts, this._connection!))
        this._servicesExplorer = new ServicesExplorer(new Ref(this, "_services"))
        this._servicesExplorer.setSelectedNode(this._servicesExplorer.children[0])
    }

    @reaction
    private renderSelectedService(): void {
        if (this._container && this._servicesExplorer?.selectedNode) {
            this._renderedService?.renderer.hide()
            this._renderedService = this._servicesExplorer.selectedNode.item
            this._renderedService.renderer.show(this._container)
        }
    }
}

interface ServiceConfiguration {
    name: string;
    stdin: boolean;
    virtualPorts: readonly number[];
}
