import { ObservableObject, unobservable } from "reactronic";
import { SidePanel } from "../SidePanel";

export class SolutionsView extends ObservableObject {
  @unobservable public readonly leftPanel = new SidePanel("Solutions");
}
