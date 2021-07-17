import { ObservableObject as NonDisposableObservableObject, Reactronic, standalone, Transaction } from "reactronic"

export class ObservableObject extends NonDisposableObservableObject {
  dispose(): void { standalone(Transaction.run, () => Reactronic.dispose(this)) }
}