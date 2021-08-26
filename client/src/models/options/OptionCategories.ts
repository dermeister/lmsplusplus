import { transaction } from "reactronic"
import { ObservableObject } from "../../ObservableObject"

export enum OptionCategory {
  Vsc,
  Preferences
}

export class OptionCategories extends ObservableObject {
  private _selectedCategory: OptionCategory = OptionCategory.Vsc

  get selectedCategory(): OptionCategory { return this._selectedCategory }

  @transaction
  setSelectedCategory(category: OptionCategory): void {
    this._selectedCategory = category
  }
}
