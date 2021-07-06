import { ObservableObject, unobservable } from "reactronic"
import { SidePanel } from "../SidePanel"

export class SolutionsView extends ObservableObject {
  @unobservable readonly leftPanel = new SidePanel("Solutions")
}
