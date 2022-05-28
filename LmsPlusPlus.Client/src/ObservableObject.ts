import { ReactiveObject as NonDisposableObservableObject, Rx, Transaction } from "reactronic"
import { IDisposable } from "./IDisposable"

export class ObservableObject extends NonDisposableObservableObject implements IDisposable {
    dispose(): void {
        Transaction.run(null, () => Rx.dispose(this))
    }
}
