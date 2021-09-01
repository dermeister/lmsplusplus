import { ObservableObject as NonDisposableObservableObject, Reactronic, Transaction } from "reactronic"
import { Disposable } from "./Disposable"

export class ObservableObject extends NonDisposableObservableObject implements Disposable {
  dispose(): void {
    Transaction.run(() => Reactronic.dispose(this))
  }
}
