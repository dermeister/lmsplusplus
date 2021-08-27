import { Solution } from "./Solution"

export enum ServiceType {
  Console,
  Web
}

export class Service {
  readonly id: number
  readonly name: string
  readonly type: ServiceType

  constructor(id: number, name: string, type: ServiceType) {
    this.id = id
    this.name = name
    this.type = type
  }
}

export class Demo {
  readonly id: number
  readonly solution: Solution
  readonly services: readonly Service[]

  constructor(id: number, solution: Solution, services: readonly Service[]) {
    this.id = id
    this.solution = solution
    this.services = services
  }
}
