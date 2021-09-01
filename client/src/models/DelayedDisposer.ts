import { reaction, throttling, Transaction, transaction } from "reactronic"
import { Disposable } from "../Disposable"
import { ObservableObject } from "../ObservableObject"

export class DelayedDisposer extends ObservableObject {
  private disposables: Disposable[] = []

  @transaction
  enqueue(disposable: Disposable): void {
    const disposables = this.disposables.toMutable()
    disposables.push(disposable)
    this.disposables = disposables
  }

  @reaction @throttling(0)
  private disposables_disposed(): void {
    if (this.disposables.length > 0)
      Transaction.runAs({ standalone: true }, () => {
        this.disposables.forEach(d => d.dispose())
        this.disposables = []
      })
  }
}
