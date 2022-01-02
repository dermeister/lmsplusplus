import { ObservableObject } from "../../ObservableObject"
import * as domain from "../../domain"
import { Monitor, options, reaction, Ref, Transaction, transaction, unobservable } from "reactronic"
import * as services from "../../services"
import { ServicesExplorer } from "./ServicesExplorer"

export class SolutionRunner extends ObservableObject {
    private static readonly monitor = Monitor.create("solution-runner", 0, 0)
    @unobservable private readonly application: services.Application
    private _servicesExplorer: ServicesExplorer | null = null
    private isApplicationMount = false

    get servicesExplorer(): ServicesExplorer | null { return this._servicesExplorer }
    get isLoadingApplication(): boolean { return SolutionRunner.monitor.isActive }

    constructor(solution: domain.Solution) {
        super()
        this.application = new services.Application(solution)
    }

    override dispose(): void {
        Transaction.run(() => {
            this._servicesExplorer?.dispose()
            this.application.dispose()
            super.dispose()
        })
    }

    @transaction
    mountApplication(container: HTMLElement): void {
        this.application.mount(container)
        this.isApplicationMount = true
    }

    @transaction
    unmountApplication(): void {
        this.application.unmount()
        this.isApplicationMount = false
    }

    @transaction
    setRenderedService(service: services.Service): void {
        this.application.setRenderedService(service)
    }

    @reaction @options({ monitor: SolutionRunner.monitor })
    private async createServicesExplorer(): Promise<void> {
        const services = await this.application.getServices()
        this._servicesExplorer = new ServicesExplorer(new Ref({ services }, "services"))
        this._servicesExplorer.setSelectedNode(this._servicesExplorer.children[0])
    }

    @reaction
    private renderSelectedService(): void {
        if (this.isApplicationMount && this._servicesExplorer?.selectedNode)
            this.application.setRenderedService(this._servicesExplorer.selectedNode.item)
    }
}

