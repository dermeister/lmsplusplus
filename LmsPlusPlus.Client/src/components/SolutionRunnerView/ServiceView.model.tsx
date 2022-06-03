import { HubConnection, ISubscription } from "@microsoft/signalr"
import { cached, isnonreactive, Transaction, transaction } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { IMessageService } from "../MessageService"
import { handleError } from "../utils"
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
    @isnonreactive private readonly _messageService: IMessageService
    private _outputSubscription: ISubscription<string> | null = null
    private _fisrtOutput = true

    @cached get renderers(): readonly IRenderer[] { return [this._consoleRenderer, ...this._webRenderers.values()] }

    constructor(name: string, stdin: boolean, virtualPorts: readonly number[], connection: HubConnection,
        serviceWorkerService: IServiceWorkerService, messageService: IMessageService) {
        super()
        this.name = name
        this.stdin = stdin
        this.virtualPorts = virtualPorts
        this._messageService = messageService
        this._serviceWorkerService = serviceWorkerService
        this._consoleRenderer = new ConsoleRenderer()
        this._webRenderers = new Map(virtualPorts.map(v => [v, new WebRenderer(v)]))
        this._connection = connection
        const stream = this._connection.stream<ServiceBuildOutput>("ReadBuildOutput", this.name)
        this._buildOutputSubscription = stream.subscribe({
            next: value => this.onBuildOutput(value),
            error: error => this.onBuildError(error),
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

    private onBuildError(_e: Error): void {
        this.writeError("\r\nThere was an error building the service.")
    }

    private onError(_e: Error): void {
        this.writeError("\r\nThere was an error while running the service.")
    }

    private onBuildOutput(output: ServiceBuildOutput): void {
        this._consoleRenderer.writeBuildOutput(output)
    }

    @transaction
    private async onBuildComplete(): Promise<void> {
        this._consoleRenderer.clear()
        this.writeInfo("Waiting for other services to build.")
        if (this.stdin)
            this._consoleRenderer.enableStdin(input => this.onInput(input))
        try {
            const stream = this._connection.stream("ReadServiceOutput", this.name)
            this._outputSubscription = stream.subscribe({
                next: value => this.onOutput(value),
                error: error => this.onError(error),
                complete: () => this.onComplete()
            })
            const portMappings = await this._connection.invoke<PortMapping[]>("GetOpenedPorts", this.name)
            if (portMappings.length > 0) {
                const worker = await this._serviceWorkerService.startServiceWorker()
                worker.postMessage(JSON.stringify(portMappings))
                for (const portMapping of portMappings) {
                    const webRenderer = this._webRenderers.get(portMapping.virtualPort)
                    webRenderer?.connectToBackend()
                }
            }
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }

    @transaction
    private onOutput(text: string): void {
        if (this._fisrtOutput) {
            this._fisrtOutput = false
            this._consoleRenderer.clear()
        }
        this._consoleRenderer.writeServiceOutput(text)
    }

    private onComplete(): void {
        this.writeInfo("Service stopped.")
    }

    private async onInput(text: string): Promise<void> {
        await this._connection.invoke("WriteServiceInput", this.name, text)
    }

    private writeInfo(text: string): void {
        this._consoleRenderer.writeServiceOutput(`\u001b[38;5;120m[INFO] ${text}\r\n\u001b[0m`)
    }

    private writeError(text: string): void {
        this._consoleRenderer.writeServiceOutput(`\u001b[38;5;9m[ERROR] ${text}\r\n\u001b[0m`)
    }
}
