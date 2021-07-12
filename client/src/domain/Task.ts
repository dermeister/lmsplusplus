import { Course } from "./Course"

export class Task {
  static readonly NO_ID = -1
  readonly id: number
  readonly course: Course
  readonly title: string
  readonly description: string

  constructor(id: number, course: Course, title: string, description: string) {
    this.id = id
    this.course = course
    this.title = title
    this.description = description
  }
}
