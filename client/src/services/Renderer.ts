import { Disposable } from "../Disposable"

export interface Renderer extends Disposable {
  mount(element: HTMLElement): void

  unmount(): void

  dispose(): void
}
