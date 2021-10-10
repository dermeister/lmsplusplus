import { Solution } from "./Solution"

export enum ServiceType {
  Console,
  Web
}

export class Service {
  readonly id: number
  readonly demo: Demo
  readonly name: string
  readonly type: ServiceType

  constructor(id: number, demo: Demo, name: string, type: ServiceType) {
    this.id = id
    this.demo = demo
    this.name = name
    this.type = type
  }
}

export class Demo {
  static readonly NO_ID = -1
  readonly id: number
  readonly solution: Solution
  private _services: readonly Service[] = []
  private servicesInitialized = false

  get services(): readonly Service[] {
    if (!this.servicesInitialized)
      throw new Error("Demo services have not been initialized")
    return this._services
  }
  set services(services: readonly Service[]) {
    if (!this.servicesInitialized) {
      this._services = services
      this.servicesInitialized = true
    } else
      throw new Error("Demo services have already been initialized")
  }

  constructor(id: number, solution: Solution) {
    this.id = id
    this.solution = solution
  }
}
