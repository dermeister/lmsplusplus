import { ObservableObject, unobservable } from "reactronic";

import { Auth } from "../../services/Auth";
import { ActivitiesModel } from "../Activities";
import { SignInModel } from "../SignIn";
import { WorkAreaModel } from "../WorkArea";

export class AppModel extends ObservableObject {
  @unobservable public readonly auth = new Auth("user");
  @unobservable public readonly signIn = new SignInModel(this.auth);
  @unobservable public readonly activities = new ActivitiesModel();
  @unobservable public readonly workArea = new WorkAreaModel(this.activities);
}
