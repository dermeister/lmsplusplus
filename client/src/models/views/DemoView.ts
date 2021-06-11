import { ObservableObject, unobservable } from "reactronic";
import { SidePanel } from "../SidePanel";

export class DemoView extends ObservableObject {
  @unobservable public readonly leftPanel = new SidePanel("Demo");
}
