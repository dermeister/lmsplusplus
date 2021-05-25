import { ObservableObject, unobservable } from "reactronic";

import { Auth } from "../../services/Auth";
import { ActivityBarModel } from "../ActivityBar";
import { SignInModel } from "../SignIn";

export class AppModel extends ObservableObject {
  @unobservable public readonly auth = new Auth("user");
  @unobservable public readonly signIn = new SignInModel(this.auth);
  @unobservable public readonly activityBar = new ActivityBarModel();
}
