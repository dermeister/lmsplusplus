import { ObservableObject as NonDisposableObservableObject, Reactronic } from "reactronic"

export class ObservableObject extends NonDisposableObservableObject {
  dispose(): void { Reactronic.dispose(this) }
}