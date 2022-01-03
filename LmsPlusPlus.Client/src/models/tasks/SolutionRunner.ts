import { ObservableObject } from "../../ObservableObject"
import * as domain from "../../domain"
import { Monitor, options, reaction, Ref, Transaction, transaction, unobservable } from "reactronic"
import { Service } from "./service/Service"
import { ServicesExplorer } from "./ServicesExplorer"
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr"

export class SolutionRunner extends ObservableObject {
    private static readonly monitor = Monitor.create("solution-runner", 0, 0)
    private _servicesExplorer: ServicesExplorer | null = null
    private connection: HubConnection | null = null
    private services: readonly Service[] | null = null
    private renderedService: Service | null = null
    private container: HTMLElement | null = null
    @unobservable private readonly solution: domain.Solution

    get servicesExplorer(): ServicesExplorer | null { return this._servicesExplorer }
    get isLoadingApplication(): boolean { return SolutionRunner.monitor.isActive }

    constructor(solution: domain.Solution) {
        super()
        this.solution = solution
    }

    override dispose(): void {
        Transaction.run(() => {
            this._servicesExplorer?.dispose()
            this.services?.forEach(s => s.dispose())
            this.connection?.stop()
            super.dispose()
        })
    }

    @transaction
    mountApplication(container: HTMLElement): void {
        this.container = container
    }

    @transaction
    unmountApplication(): void {
        this.container = null
    }

    @reaction @options({ monitor: SolutionRunner.monitor })
    private async createServicesExplorer(): Promise<void> {
        const connection = new HubConnectionBuilder().withUrl("/api/application").build()
        await connection.start()
        const configurations = await connection.invoke<ServiceConfiguration[]>("StartApplication", 1)
        this.services = configurations.map(c => new Service(c.name, c.stdin, c.virtualPorts, connection))
        this.connection = connection
        this._servicesExplorer = new ServicesExplorer(new Ref(this, "services"))
        this._servicesExplorer.setSelectedNode(this._servicesExplorer.children[0])
    }

    @reaction
    private renderSelectedService(): void {
        if (this.container && this._servicesExplorer?.selectedNode) {
            this.renderedService?.renderer.hide()
            this.renderedService = this._servicesExplorer.selectedNode.item
            this.renderedService.renderer.show(this.container)
        }
    }
}

interface ServiceConfiguration {
    name: string;
    stdin: boolean;
    virtualPorts: number[];
}
