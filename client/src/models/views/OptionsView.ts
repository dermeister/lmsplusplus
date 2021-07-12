import { unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { SidePanel } from "../SidePanel"

export class OptionsView extends ObservableObject {
  @unobservable readonly leftPanel = new SidePanel("Options")
}
