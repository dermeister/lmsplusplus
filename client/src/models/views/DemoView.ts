import { unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { SidePanel } from "../SidePanel"

export class DemoView extends ObservableObject {
  @unobservable readonly leftPanel = new SidePanel("Demo")
}
