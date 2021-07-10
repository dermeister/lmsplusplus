import { Course } from "./Course"

export class Task {
  readonly id: number | null
  readonly course: Course
  readonly title: string
  readonly description: string

  constructor(id: number | null, course: Course, title: string, description: string) {
    this.id = id
    this.course = course
    this.title = title
    this.description = description
  }
}
