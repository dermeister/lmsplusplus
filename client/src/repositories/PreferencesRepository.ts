import { reaction, transaction } from "reactronic"
import { Preferences } from "../domain/Preferences"
import { ObservableObject } from "../ObservableObject"

export abstract class PreferencesRepository extends ObservableObject {
  protected _preferences: Preferences = Preferences.default

  get preferences(): Preferences { return this._preferences }
}

export class PreferencesRepositoryInternal extends PreferencesRepository {
  @transaction
  async update(preferences: Preferences): Promise<void> {
    await new Promise(r => setTimeout(r, 0))

    this._preferences = preferences
  }

  @reaction
  private async preferences_fetched_from_api(): Promise<void> {
    this._preferences = new Preferences(true)
  }
}
