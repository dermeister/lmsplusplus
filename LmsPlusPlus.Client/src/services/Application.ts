import { ObservableObject } from "../ObservableObject"
import { Transaction, transaction, unobservable } from "reactronic"
import * as domain from "../domain"
import { Service } from "./Service"
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr"

export class Application extends ObservableObject {
    @unobservable private readonly solution: domain.Solution
    private renderedService: Service | null = null
    private container: HTMLElement | null = null
    private connection: HubConnection | null = null
    private services: readonly Service[] | null = null

    constructor(solution: domain.Solution) {
        super()
        this.solution = solution
    }

    override dispose(): void {
        Transaction.run(() => {
            this.services?.forEach(s => s.dispose())
            this.connection?.stop()
            super.dispose()
        })
    }

    @transaction
    mount(container: HTMLElement): void {
        this.container = container
    }

    @transaction
    unmount(): void {
        if (this.container)
            this.container = null
    }

    @transaction
    async getServices(): Promise<readonly Service[]> {
        if (this.services)
            return this.services
        const connection = new HubConnectionBuilder().withUrl("/api/application").build()
        await connection.start()
        const configurations = await connection.invoke<ServiceConfiguration[]>("StartApplication", 1)
        this.services = configurations.map(c => new Service(c.name, c.stdin, c.virtualPorts, connection))
        this.connection = connection
        return this.services
    }

    @transaction
    setRenderedService(service: Service): void {
        if (!this.container)
            throw new Error("Application is not mount")
        this.renderedService?.renderer.hide()
        this.renderedService = service
        this.renderedService.renderer.show(this.container)
    }
}

interface ServiceConfiguration {
    name: string;
    stdin: boolean;
    virtualPorts: number[];
}
