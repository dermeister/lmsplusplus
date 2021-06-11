import { ObservableObject, unobservable } from "reactronic";
import { Course } from "../../domain/Course";
import { Task } from "../../domain/Task";
import { CourseExplorer } from "../CourseExplorer";
import { SidePanel } from "../SidePanel";

export class TasksView extends ObservableObject {
  @unobservable public readonly leftPanel = new SidePanel("Tasks");
  @unobservable public readonly explorer = new CourseExplorer([
    new Course("СПП", [new Task("Task 1"), new Task("Task 2")]),
    new Course("ЯП", [new Task("Task 1"), new Task("Task 2"), new Task("Task 3")]),
  ]);
}
