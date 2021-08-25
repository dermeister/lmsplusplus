import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import styles from "./OptionCategories.module.scss"

interface OptionCategoriesProps {
  model: models.OptionCategories
}

function optionCategory(model: models.OptionCategories,
  category: models.OptionCategory,
  text: string): JSX.Element {
  return (
    <li onClick={() => model.setCurrentItem(category)} className={styles.category}>
      {text}
    </li>
  )
}

export function OptionCategories({ model }: OptionCategoriesProps): JSX.Element {
  return autorender(() => (
    <ul className={styles.categories}>
      {optionCategory(model, models.OptionCategory.Vcs, "VCS")}
      {optionCategory(model, models.OptionCategory.Preferences, "Preferences")}
    </ul>
  ), [model])
}
