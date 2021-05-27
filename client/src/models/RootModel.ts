import { ObservableObject, unobservable } from "reactronic";
import { AppModel } from "./AppModel";
import { SignInModel } from "./SignInModel";
import { Auth } from "../services/Auth";

export class RootModel extends ObservableObject {
  @unobservable public readonly auth = new Auth("user");
  @unobservable public readonly signIn = new SignInModel(this.auth);
  @unobservable public readonly app = new AppModel();
}
