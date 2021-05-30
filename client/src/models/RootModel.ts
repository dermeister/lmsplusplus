import { ObservableObject, unobservable } from "reactronic";
import { Auth } from "../services/Auth";
import { AppModel } from "./AppModel";
import { SignInModel } from "./SignInModel";
import { WindowManagerModel } from "./WindowManager";

export class RootModel extends ObservableObject {
  @unobservable public readonly auth = new Auth("user");
  @unobservable public readonly signIn = new SignInModel(this.auth);
  @unobservable public readonly app = new AppModel();
  @unobservable public readonly windowManager = new WindowManagerModel();
}
