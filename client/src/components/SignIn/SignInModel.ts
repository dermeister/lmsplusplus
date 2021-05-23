import { ObservableObject, unobservable } from "reactronic";
import { Auth } from "../../services/Auth";

export class SignInModel extends ObservableObject {
  @unobservable public readonly auth: Auth;

  public constructor(auth: Auth) {
    super();
    this.auth = auth;
  }
}
