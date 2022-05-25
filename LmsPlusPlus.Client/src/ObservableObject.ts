import { ObservableObject as NonDisposableObservableObject, Rx, Transaction } from "reactronic"
import { IDisposable } from "./IDisposable"

export class ObservableObject extends NonDisposableObservableObject implements IDisposable {
  dispose(): void {
    Transaction.run(() => Rx.dispose(this))
  }
}
