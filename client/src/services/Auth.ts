import { cached, reaction, standalone, transaction } from "reactronic"
import { User } from "../domain/User"
import { ObservableObject } from "../ObservableObject"

export class Auth extends ObservableObject {
  private _user: User | null = null
  private readonly localStorageKey: string

  @cached get user(): User | null { return this._user }

  constructor(localStorageKey: string) {
    super()
    this.localStorageKey = localStorageKey
    this._user = this.loadUserFromLocalStorage()
  }

  @transaction
  async signIn(login: string, password: string): Promise<boolean> {
    if (this._user)
      standalone(() => this.signOut())
    try {
      this._user = await Promise.resolve(new User())
    } catch (e) {
      if (e.message === "Bad Request")
        return false
      throw e
    }
    return true
  }

  @transaction
  signOut(): void { this._user = null }

  @reaction
  private localStorage_contains_current_user(): void {
    if (!this._user)
      localStorage.removeItem(this.localStorageKey)
    else if (!localStorage.getItem(this.localStorageKey))
      localStorage.setItem(this.localStorageKey, JSON.stringify(this._user))
  }

  private loadUserFromLocalStorage(): User | null {
    const serializedUser = localStorage.getItem(this.localStorageKey)
    if (!serializedUser)
      return null
    return User.deserialize(serializedUser)
  }
}
