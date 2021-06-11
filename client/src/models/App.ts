import { ObservableObject, unobservable } from "reactronic";
import { Views } from "./Views";

export class App extends ObservableObject {
  @unobservable public readonly views = new Views();
}
