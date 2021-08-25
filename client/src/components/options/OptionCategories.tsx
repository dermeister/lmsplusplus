import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import styles from "./OptionCategories.module.scss"

interface OptionCategoriesProps {
  model: models.OptionCategories
}

export function OptionCategories({ model }: OptionCategoriesProps): JSX.Element {
  return autorender(() => (
    <ul className={styles.categories}>
      {optionCategory(model, models.OptionCategory.Vsc, "VSC")}
      {optionCategory(model, models.OptionCategory.Preferences, "Preferences")}
    </ul>
  ), [model])
}

function optionCategory(model: models.OptionCategories,
                        category: models.OptionCategory,
                        text: string): JSX.Element {
  const isSelected = model.currentCategory === category
  return (
    <li onClick={() => model.setCurrentItem(category)} className={buildCategoryClassName(isSelected)}>
      {text}
    </li>
  )
}

function buildCategoryClassName(isSelected: boolean): string {
  let result = styles.category
  if (isSelected)
    result += ` ${styles.selected}`
  return result
}
