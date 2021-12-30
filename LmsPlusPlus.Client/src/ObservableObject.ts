import { ObservableObject as NonDisposableObservableObject, Rx, Transaction } from "reactronic"
import { Disposable } from "./Disposable"

export class ObservableObject extends NonDisposableObservableObject implements Disposable {
  dispose(): void {
    Transaction.run(() => Rx.dispose(this))
  }
}
