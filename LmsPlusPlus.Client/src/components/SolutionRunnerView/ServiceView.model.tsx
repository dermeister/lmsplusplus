import { HubConnection, ISubscription } from "@microsoft/signalr"
import { cached, isnonreactive, Transaction, transaction } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ConsoleRenderer, ServiceBuildOutput } from "./ConsoleRenderer.model"
import { IRenderer } from "./IRenderer"
import { IServiceWorkerService } from "./IServiceWorkerService"
import { WebRenderer } from "./WebRenderer.model"

interface PortMapping {
    port: number
    virtualPort: number
}

export class ServiceView extends ObservableObject {
    @isnonreactive readonly name: string
    @isnonreactive readonly stdin: boolean
    @isnonreactive readonly virtualPorts: readonly number[]
    @isnonreactive private readonly _consoleRenderer: ConsoleRenderer
    @isnonreactive private readonly _webRenderers: Map<number, WebRenderer>
    @isnonreactive private readonly _connection: HubConnection
    @isnonreactive private readonly _buildOutputSubscription: ISubscription<ServiceBuildOutput>
    @isnonreactive private readonly _serviceWorkerService: IServiceWorkerService
    private _outputSubscription: ISubscription<string> | null = null

    @cached get renderers(): readonly IRenderer[] { return [this._consoleRenderer, ...this._webRenderers.values()] }

    constructor(name: string, stdin: boolean, virtualPorts: readonly number[], connection: HubConnection,
        serviceWorkerService: IServiceWorkerService) {
        super()
        this.name = name
        this.stdin = stdin
        this.virtualPorts = virtualPorts
        this._serviceWorkerService = serviceWorkerService
        this._consoleRenderer = new ConsoleRenderer()
        this._webRenderers = new Map(virtualPorts.map(v => [v, new WebRenderer(v)]))
        this._connection = connection
        const stream = this._connection.stream<ServiceBuildOutput>("ReadBuildOutput", this.name)
        this._buildOutputSubscription = stream.subscribe({
            next: value => this.onBuildOutput(value),
            error: error => ServiceView.onBuildError(error),
            complete: () => this.onBuildComplete()
        })
    }

    override dispose(): void {
        Transaction.run(null, () => {
            this._buildOutputSubscription.dispose()
            this._outputSubscription?.dispose()
            this._consoleRenderer.dispose()
            this._webRenderers.forEach(r => r.dispose())
            this._webRenderers.toMutable().clear()
            super.dispose()
        })
    }

    private static onBuildError(error: Error): void {
        console.error(`BUILD: ${error}`)
    }

    private static onError(error: Error): void {
        console.error(`OUTPUT: ${error}`)
    }

    private onBuildOutput(output: ServiceBuildOutput): void {
        this._consoleRenderer.writeBuildOutput(output)
    }

    @transaction
    private async onBuildComplete(): Promise<void> {
        this._consoleRenderer.clear()
        if (this.stdin)
            this._consoleRenderer.enableStdin(input => this.onInput(input))
        const stream = this._connection.stream("ReadServiceOutput", this.name)
        this._outputSubscription = stream.subscribe({
            next: value => this.onOutput(value),
            error: error => ServiceView.onError(error),
            complete: () => this.onComplete()
        })
        const portMappings = await this._connection.invoke<PortMapping[]>("GetOpenedPorts", this.name)
        const worker = await this._serviceWorkerService.startServiceWorker()
        if (worker) {
            worker.postMessage(JSON.stringify(portMappings))
            for (const portMapping of portMappings) {
                const webRenderer = this._webRenderers.get(portMapping.virtualPort)
                webRenderer?.connectToBackend()
            }
        }
    }

    private onOutput(text: string): void {
        this._consoleRenderer.writeServiceOutput(text)
    }

    private onComplete(): void {
        this._consoleRenderer.writeServiceOutput("\r\n\u001b[38;5;120m[INFO] Service stopped\r\n")
    }

    private async onInput(text: string): Promise<void> {
        await this._connection.invoke("WriteServiceInput", this.name, text)
    }
}
