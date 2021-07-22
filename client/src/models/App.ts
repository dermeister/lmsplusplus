import { Views } from "./Views"

export class App {
  readonly views = new Views()

  dispose(): void { this.views.dispose() }
}
