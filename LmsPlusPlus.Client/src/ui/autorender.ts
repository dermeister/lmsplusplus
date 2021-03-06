import { useCallback, useEffect, useState } from "react"
import { cached, ReactiveObject, options, reaction, Rx, Transaction, isnonreactive } from "reactronic"

export function autorender(jsx: () => JSX.Element, deps: unknown[] = []): JSX.Element {
    const [state, refresh] = useState(createReactState)
    const { rx } = state
    rx.refresh = refresh
    useEffect(() => rx.unmount, [])
    return rx.render(useCallback(jsx, deps))
}

type ReactState = { rx: RxComponent }

class RxComponent extends ReactiveObject {
    @isnonreactive refresh: ((rx: ReactState) => void) | null = null
    @isnonreactive unmount: () => void = () => Transaction.run(null, Rx.dispose, this)

    @cached @options({ triggeringArgs: true })
    render(jsx: () => JSX.Element): JSX.Element { return jsx() }

    @reaction
    private ensureUpToDate(): void {
        if (!Rx.getController(this.render).isUpToDate)
            Transaction.off(() => this.refresh?.({ rx: this }))
    }
}

function createReactState(): ReactState {
    return { rx: Transaction.run(null, () => new RxComponent()) }
}
