import { Transaction, transaction, unobservable } from "reactronic"
import { Renderer } from "./Renderer"
import { ConsoleRenderer } from "./ConsoleRenderer"
import { ObservableObject } from "../../../ObservableObject"
import { WebRenderer } from "./WebRenderer"
import { HubConnection } from "@microsoft/signalr"

export class Service extends ObservableObject {
    @unobservable readonly name: string
    @unobservable readonly stdin: boolean
    @unobservable readonly virtualPorts: readonly number[]
    @unobservable private readonly _consoleRenderer: ConsoleRenderer
    @unobservable private readonly _webRenderers: Map<number, WebRenderer>
    private _renderer: Renderer

    get renderer(): Renderer { return this._renderer }

    constructor(name: string, stdin: boolean, virtualPorts: readonly number[], connection: HubConnection) {
        super()
        this.name = name
        this.stdin = stdin
        this.virtualPorts = virtualPorts
        this._consoleRenderer = new ConsoleRenderer()
        this._webRenderers = new Map(virtualPorts.map(p => [p, new WebRenderer(p)]))
        this._renderer = this._consoleRenderer
    }

    override dispose(): void {
        Transaction.run(() => {
            this._consoleRenderer.dispose()
            this._webRenderers.forEach(r => r.dispose())
            this._webRenderers.toMutable().clear()
        })
    }

    @transaction
    selectConsoleRenderer(): void {
        this._renderer = this._consoleRenderer
    }

    @transaction
    selectWebRenderer(port: number): void {
        if (!this._webRenderers.has(port))
            throw new Error(`Web renderer for port ${port} does not exist`)
        this._renderer = this._webRenderers.get(port) as WebRenderer
    }
}

abstract class ServiceView {

}

class ConsoleServiceView extends ServiceView {}

class WebServiceView extends ServiceView {
    readonly port: number

    constructor(port: number) {
        super()
        this.port = port
    }
}

class NewService extends ObservableObject {
    @unobservable readonly name: string
    @unobservable readonly stdin: boolean
    @unobservable readonly virtualPorts: readonly number[]
    @unobservable private readonly consoleView = new ConsoleServiceView()
    private _view: ServiceView

    get view(): ServiceView { return this._view }

    constructor(name: string, stdin: boolean, virtualPorts: readonly number[], connection: HubConnection) {
        super()
        this.name = name
        this.stdin = stdin
        this.virtualPorts = virtualPorts
        this._view = this.consoleView
    }

    override dispose(): void {
        Transaction.run(() => {
            super.dispose()
        })
    }

    @transaction
    selectConsoleView(): void {
        this._view = this.consoleView
    }

    @transaction
    async selectWebView(virtualPort: number): Promise<void> {
        // get opened ports 
    }
}
