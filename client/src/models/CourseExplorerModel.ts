import { unobservable } from "reactronic";

import { Course } from "../domain/Course";
import { Task } from "../domain/Task";
import { ExplorerGroupNode, ExplorerItemNode, ExplorerModel, ExplorerNode } from "./ExplorerModel";

export class CourseExplorerModel extends ExplorerModel {
  @unobservable public readonly roots: ExplorerNode[];

  public constructor(data: Course[]) {
    super();
    this.roots = this.buildExplorerRoots(data);
  }

  private buildExplorerRoots(courses: Course[]): ExplorerNode[] {
    let key = 0;

    function nextKey(): string {
      key += 1;
      return key.toString();
    }

    function taskNode(task: Task): ExplorerNode {
      return new ExplorerItemNode(task.title, nextKey());
    }

    function courseNode(course: Course): ExplorerNode {
      return new ExplorerGroupNode(course.name, nextKey(), course.tasks.map(taskNode));
    }

    return courses.map(courseNode);
  }
}
