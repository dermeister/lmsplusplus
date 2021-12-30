import { useCallback, useEffect, useState } from "react"
import { cached, ObservableObject, options, reaction, Rx, standalone, Transaction, unobservable } from "reactronic"

export function autorender(jsx: () => JSX.Element, deps: unknown[] = []): JSX.Element {
    const [state, refresh] = useState(createReactState)
    const { rx } = state
    rx.refresh = refresh
    useEffect(() => rx.unmount, [])
    return rx.render(useCallback(jsx, deps))
}

type ReactState = { rx: RxComponent }

class RxComponent extends ObservableObject {
    @unobservable refresh: ((rx: ReactState) => void) | null = null
    @unobservable unmount: () => void = () => standalone(Transaction.run, () => Rx.dispose(this))

    @cached @options({ sensitiveArgs: true })
    render(jsx: () => JSX.Element): JSX.Element { return jsx() }

    @reaction
    private ensureUpToDate(): void {
        if (!Rx.getController(this.render).isUpToDate)
            standalone(() => this.refresh?.({ rx: this }))
    }
}

function createReactState(): ReactState {
    return { rx: Transaction.run(() => new RxComponent()) }
}
