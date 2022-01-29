import { ObservableObject } from "../../ObservableObject"
import * as domain from "../../domain"
import { Monitor, options, reaction, Ref, Transaction, unobservable } from "reactronic"
import { Service } from "./service/Service"
import { ServicesExplorer } from "./ServicesExplorer"
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr"
import { ServiceView } from "./service/ServiceView"
import serviceWorkerUrl from "../../../service-worker?url"

interface ServiceConfiguration {
    name: string;
    stdin: boolean;
    virtualPorts: readonly number[];
}

interface PortMapping {
    port: number;
    virtualPort: number;
}

export class SolutionRunner extends ObservableObject {
    private static readonly s_monitor = Monitor.create("solution-runner", 0, 0)
    @unobservable private readonly _solution: domain.Solution
    private _servicesExplorer: ServicesExplorer | null = null
    private _connection: HubConnection | null = null
    private _services: readonly Service[] | null = null
    private _serviceView: ServiceView | null = null
    private _serviceWorkerRegistration: ServiceWorkerRegistration | null = null
    private _areServicePortsBeingOpened = false

    get servicesExplorer(): ServicesExplorer | null { return this._servicesExplorer }
    get isLoadingApplication(): boolean { return SolutionRunner.s_monitor.isActive }
    get serviceView(): ServiceView | null { return this._serviceView }

    constructor(solution: domain.Solution) {
        super()
        this._solution = solution
    }

    override dispose(): Promise<void> {
        return Transaction.run(() => {
            this._servicesExplorer?.dispose()
            this._services?.forEach(s => s.dispose())
            this._connection?.stop()
            super.dispose()
            return this._serviceWorkerRegistration?.unregister().then() ?? Promise.resolve()
        })
    }

    @reaction @options({ monitor: SolutionRunner.s_monitor })
    private async createServicesExplorer(): Promise<void> {
        this._connection = new HubConnectionBuilder().withUrl("/api/application").build()
        await this._connection.start()
        const configurations = await this._connection.invoke<ServiceConfiguration[]>("StartApplication", 1)
        this._areServicePortsBeingOpened = configurations.some(c => c.virtualPorts.length > 0)
        this._services = configurations.map(c =>
            new Service(c.name, c.stdin, c.virtualPorts, new Ref(this, "_areServicePortsBeingOpened"), this._connection!))
        this._servicesExplorer = new ServicesExplorer(new Ref(this, "_services"))
        this._servicesExplorer.setSelectedNode(this._servicesExplorer.children[0])
    }

    @reaction
    private updateServiceView(): void {
        if (this._servicesExplorer?.selectedNode)
            this._serviceView = this._servicesExplorer.selectedNode.item.renderer
    }

    @reaction
    private async getOpenedPorts(): Promise<void> {
        if (this._areServicePortsBeingOpened) {
            const portMappingsPromises =
                this._services!.map(s => this._connection!.invoke<PortMapping[]>("GetOpenedPorts", s.name))
            const portMappings = (await Promise.all(portMappingsPromises)).flat()
            if (navigator.serviceWorker) {
                this._serviceWorkerRegistration = await navigator.serviceWorker.register(serviceWorkerUrl, { type: "module" })
                const { waiting, installing, active } = this._serviceWorkerRegistration
                const worker = waiting || installing || active
                worker?.addEventListener("statechange", ({ target }) => {
                    const worker = target as ServiceWorker
                    if (worker.state === "activated") {
                        worker.postMessage(JSON.stringify(portMappings))
                        Transaction.run(() => this._areServicePortsBeingOpened = false)
                    }
                })
            }
        }
    }
}
