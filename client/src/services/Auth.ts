import { cached, ObservableObject, standalone, transaction } from "reactronic";

import { User } from "../models/User";

export class Auth extends ObservableObject {
  private _user: User | null = null;
  private localStorageKey: string;

  public constructor(localStorageKey: string) {
    super();
    this.localStorageKey = localStorageKey;
    this._user = this.loadUserFromLocalStorage();
  }

  @cached
  public get user(): User | null {
    return this._user;
  }

  @transaction
  public async signIn(login: string, password: string): Promise<boolean> {
    if (this._user !== null) standalone(() => this.signOut());

    try {
      this._user = await Promise.resolve(new User());
      localStorage.setItem(this.localStorageKey, JSON.stringify(this._user));
    } catch (e) {
      if (e.message === "Bad Request") return false;
      throw e;
    }

    return true;
  }

  @transaction
  public signOut(): void {
    this._user = null;
    localStorage.removeItem(this.localStorageKey);
  }

  private loadUserFromLocalStorage(): User | null {
    const serializedUser = localStorage.getItem(this.localStorageKey);
    if (serializedUser === null) return null;

    return User.deserialize(serializedUser);
  }
}
