import { cached, ObservableObject, reaction, standalone, transaction } from "reactronic"
import { User } from "../domain/User"

export class Auth extends ObservableObject {
  private _user: User | null = null
  private localStorageKey: string

  @cached
  get user(): User | null {
    return this._user
  }

  constructor(localStorageKey: string) {
    super()
    this.localStorageKey = localStorageKey
    this._user = this.loadUserFromLocalStorage()
  }

  @transaction
  async signIn(login: string, password: string): Promise<boolean> {
    if (this._user !== null) standalone(() => this.signOut())

    try {
      this._user = await Promise.resolve(new User())
    } catch (e) {
      if (e.message === "Bad Request") return false
      throw e
    }

    return true
  }

  @transaction
  signOut(): void {
    this._user = null
  }

  private loadUserFromLocalStorage(): User | null {
    const serializedUser = localStorage.getItem(this.localStorageKey)
    if (serializedUser === null) return null

    return User.deserialize(serializedUser)
  }

  @reaction
  private updateLocalStorage(): void {
    if (this._user === null) {
      localStorage.removeItem(this.localStorageKey)
    } else if (localStorage.getItem(this.localStorageKey) === null) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this._user))
    }
  }
}
