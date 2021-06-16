import { ObservableObject, unobservable } from "reactronic";
import { Course } from "../../domain/Course";
import { Task } from "../../domain/Task";
import { SidePanel } from "../SidePanel";
import { TasksExplorer } from "../tasks/TasksExplorer";

export class TasksView extends ObservableObject {
  @unobservable public readonly leftPanel = new SidePanel("Tasks");
  @unobservable public readonly explorer = new TasksExplorer([
    new Course("СПП", [new Task("Task 1"), new Task("Task 2")]),
    new Course("ЯП", [new Task("Task 1"), new Task("Task 2"), new Task("Task 3")]),
  ]);
}
