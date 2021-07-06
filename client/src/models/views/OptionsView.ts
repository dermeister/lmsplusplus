import { ObservableObject, unobservable } from "reactronic"
import { SidePanel } from "../SidePanel"

export class OptionsView extends ObservableObject {
  @unobservable readonly leftPanel = new SidePanel("Options")
}
