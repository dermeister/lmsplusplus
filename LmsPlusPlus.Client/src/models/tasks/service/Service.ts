import { Ref, Transaction, transaction, unobservable } from "reactronic"
import { Renderer } from "./Renderer"
import { ServiceConsole } from "./ServiceConsole"
import { ObservableObject } from "../../../ObservableObject"
import { ServiceWebview } from "./ServiceWebview"
import { HubConnection, ISubscription } from "@microsoft/signalr"
import { ServiceBuildOutput } from "./ServiceBuildOutput"

export class Service extends ObservableObject {
    @unobservable readonly name: string
    @unobservable readonly stdin: boolean
    @unobservable readonly virtualPorts: readonly number[]
    @unobservable private readonly _console: ServiceConsole
    @unobservable private readonly _webviews: Map<number, ServiceWebview>
    @unobservable private readonly _connection: HubConnection
    @unobservable private readonly _buildOutputSubscription: ISubscription<ServiceBuildOutput>
    private _outputSubscription: ISubscription<string> | null = null
    private _renderer: Renderer

    get renderer(): Renderer { return this._renderer }

    constructor(name: string, stdin: boolean, virtualPorts: readonly number[], arePortsBeingOpened: Ref<boolean>,
        connection: HubConnection) {
        super()
        this.name = name
        this.stdin = stdin
        this.virtualPorts = virtualPorts
        this._connection = connection
        this._console = new ServiceConsole()
        this._webviews = new Map(virtualPorts.map(p => [p, new ServiceWebview(p, arePortsBeingOpened)]))
        this._renderer = this._console
        const stream = this._connection.stream<ServiceBuildOutput>("ReadBuildOutput", this.name)
        this._buildOutputSubscription = stream.subscribe({
            next: value => this.onBuildOutput(value),
            error: error => Service.onBuildError(error),
            complete: () => this.onBuildComplete()
        })
    }

    override dispose(): void {
        Transaction.run(() => {
            this._console.dispose()
            this._webviews.forEach(r => r.dispose())
            this._webviews.toMutable().clear()
            this._buildOutputSubscription.dispose()
            this._outputSubscription?.dispose()
        })
    }

    @transaction
    selectConsoleRenderer(): void {
        this._renderer = this._console
    }

    @transaction
    selectWebRenderer(port: number): void {
        if (!this._webviews.has(port))
            throw new Error(`Webview for port ${port} does not exist`)
        this._renderer = this._webviews.get(port) as ServiceWebview
    }

    private static onBuildError(error: Error): void {
        console.error(`BUILD: ${error}`)
    }

    private static onError(error: Error): void {
        console.error(`OUTPUT: ${error}`)
    }

    private onBuildOutput(output: ServiceBuildOutput): void {
        this._console.writeBuildOutput(output)
    }

    @transaction
    private onBuildComplete(): void {
        this._console.clear()
        if (this.stdin)
            this._console.enableStdin(input => this.onInput(input))
        const stream = this._connection.stream("ReadServiceOutput", this.name)
        this._outputSubscription = stream.subscribe({
            next: value => this.onOutput(value),
            error: error => Service.onError(error),
            complete: () => this.onComplete()
        })
        if (this.virtualPorts.length > 0)
            this._renderer = this._webviews.get(this.virtualPorts[0]) as Renderer
    }

    private onOutput(text: string): void {
        this._console.writeServiceOutput(text)
    }

    private onComplete(): void {
        this._console.writeServiceOutput("\r\n\u001b[38;5;120m[INFO] Service stopped\r\n")
    }

    private async onInput(text: string): Promise<void> {
        await this._connection.invoke("WriteServiceInput", this.name, text)
    }
}
