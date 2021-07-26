import { reaction, transaction } from "reactronic"
import { User } from "../domain/User"
import { ObservableObject } from "../ObservableObject"

export class UserRepository extends ObservableObject {
  private _user = User.default

  get user(): User { return this._user }

  @transaction
  async update(user: User): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))

    this._user = user
  }

  @reaction
  private async user_fetched_from_api(): Promise<void> {
    this._user = new User()
  }
}
