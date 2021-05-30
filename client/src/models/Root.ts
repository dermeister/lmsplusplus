import { ObservableObject, unobservable } from "reactronic";
import { Auth } from "../services/Auth";
import { App } from "./App";
import { SignIn } from "./SignIn";
import { WindowManager } from "./WindowManager";

export class Root extends ObservableObject {
  @unobservable public readonly auth = new Auth("user");
  @unobservable public readonly signIn = new SignIn(this.auth);
  @unobservable public readonly app = new App();
  @unobservable public readonly windowManager = new WindowManager();
}
