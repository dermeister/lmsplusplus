import { transaction } from "reactronic"
import { ObservableObject } from "../../ObservableObject"

export enum OptionCategory {
  Vsc,
  Preferences
}

export class OptionCategories extends ObservableObject {
  private _currentCategory: OptionCategory = OptionCategory.Preferences

  get currentCategory(): OptionCategory { return this._currentCategory }

  @transaction
  setCurrentItem(category: OptionCategory): void {
    this._currentCategory = category
  }
}
