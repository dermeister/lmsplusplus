import { ObservableObject, transaction, unobservable } from "reactronic";
import { Auth } from "../services/Auth";

export class SignIn extends ObservableObject {
  @unobservable public readonly auth: Auth;
  public login = "";
  public password = "";
  public error = false;

  public constructor(auth: Auth) {
    super();
    this.auth = auth;
  }

  @transaction
  public setLogin(login: string): void {
    this.login = login;
  }

  @transaction
  public setPassword(password: string): void {
    this.password = password;
  }

  @transaction
  public async signIn(): Promise<void> {
    const success = await this.auth.signIn(this.login, this.password);
    this.error = !success;
  }
}
