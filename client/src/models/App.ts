import { ObservableObject, reaction, transaction, unobservable } from "reactronic";
import { Course } from "../domain/Course";
import { Task } from "../domain/Task";
import { Auth } from "../services/Auth";
import { Activities } from "./Activities";
import { CourseExplorer } from "./CourseExplorer";
import { SidePanel } from "./SidePanel";
import { SignIn } from "./SignIn";

export class App extends ObservableObject {
  @unobservable public readonly auth = new Auth("user");
  @unobservable public readonly signIn = new SignIn(this.auth);
  @unobservable public readonly activities = new Activities();
  @unobservable public readonly leftSidePanel = new SidePanel();
  @unobservable public readonly explorer = new CourseExplorer([
    new Course("SPP", [new Task("Task 1"), new Task("Task 2")]),
    new Course("OSiSP", [new Task("Task 1"), new Task("Task 2"), new Task("Task 3")]),
  ]);

  @transaction
  public hideLeftSidePanel(): void {
    this.leftSidePanel.close();
  }

  @reaction
  private showLeftSidePanelOnActivitySwitch(): void {
    this.activities.current;
    this.leftSidePanel.open();
  }
}
