import { ObservableObject, reaction, transaction, unobservable } from "reactronic";

import { Auth } from "../services/Auth";
import { SignInModel } from "./SignInModel";
import { ActivitiesModel } from "./ActivitiesModel";
import { SidePanelModel } from "./SidePanelModel";
import { CourseExplorerModel } from "./CourseExplorerModel";
import { Course } from "../domain/Course";
import { Task } from "../domain/Task";

export class AppModel extends ObservableObject {
  @unobservable public readonly auth = new Auth("user");
  @unobservable public readonly signIn = new SignInModel(this.auth);
  @unobservable public readonly activities = new ActivitiesModel();
  @unobservable public readonly leftSidePanel = new SidePanelModel();
  @unobservable public readonly explorer = new CourseExplorerModel([
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
