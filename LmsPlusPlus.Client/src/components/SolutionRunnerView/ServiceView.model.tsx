import { HubConnection, ISubscription } from "@microsoft/signalr"
import React from "react"
import { cached, Transaction, transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ConsoleRenderer, ServiceBuildOutput } from "./ConsoleRenderer.model"
import { IRenderer } from "./IRenderer"
import * as view from "./ServiceView.view"
import { WebRenderer } from "./WebRenderer.model"

export class ServiceView extends ObservableObject {
    @unobservable readonly name: string
    @unobservable readonly stdin: boolean
    @unobservable readonly virtualPorts: readonly number[]
    @unobservable private readonly _consoleRenderer: ConsoleRenderer
    @unobservable private readonly _webRenderers: Map<number, WebRenderer>
    @unobservable private readonly _connection: HubConnection
    @unobservable private readonly _buildOutputSubscription: ISubscription<ServiceBuildOutput>
    private _outputSubscription: ISubscription<string> | null = null
    private _currentRenderer: IRenderer

    constructor(name: string, stdin: boolean, virtualPorts: readonly number[], connection: HubConnection) {
        super()
        this.name = name
        this.stdin = stdin
        this.virtualPorts = virtualPorts
        this._consoleRenderer = new ConsoleRenderer()
        this._webRenderers = new Map()
        this._currentRenderer = this._consoleRenderer
        this._connection = connection
        const stream = this._connection.stream<ServiceBuildOutput>("ReadBuildOutput", this.name)
        this._buildOutputSubscription = stream.subscribe({
            next: value => this.onBuildOutput(value),
            error: error => ServiceView.onBuildError(error),
            complete: () => this.onBuildComplete()
        })
    }

    override dispose(): void {
        Transaction.run(() => {
            this._consoleRenderer.dispose()
            this._webRenderers.forEach(r => r.dispose())
            this._webRenderers.toMutable().clear()
            this._buildOutputSubscription.dispose()
            this._outputSubscription?.dispose()
            super.dispose()
        })
    }

    @cached
    render(): JSX.Element {
        const renderes = [this._consoleRenderer, ...this._webRenderers.values()]
        return <view.ServiceView renderers={renderes} currentRenderer={this._currentRenderer} />
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
    private onBuildComplete(): void {
        this._consoleRenderer.clear()
        if (this.stdin)
            this._consoleRenderer.enableStdin(input => this.onInput(input))
        const stream = this._connection.stream("ReadServiceOutput", this.name)
        this._outputSubscription = stream.subscribe({
            next: value => this.onOutput(value),
            error: error => ServiceView.onError(error),
            complete: () => this.onComplete()
        })
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
