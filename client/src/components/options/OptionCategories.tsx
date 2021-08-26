import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import styles from "./OptionCategories.module.scss"

interface OptionCategoriesProps {
  model: models.OptionCategories
  className?: string
}

export function OptionCategories({ model, className }: OptionCategoriesProps): JSX.Element {
  return autorender(() => (
    <ul className={buildCategoriesClassName(className)}>
      {optionCategory(model, models.OptionCategory.Vsc, "VSC")}
      {optionCategory(model, models.OptionCategory.Preferences, "Preferences")}
    </ul>
  ), [model])
}

function optionCategory(model: models.OptionCategories,
  category: models.OptionCategory,
  text: string): JSX.Element {
  const isSelected = model.selectedCategory === category
  return (
    <li onClick={() => model.setSelectedCategory(category)} className={buildCategoryClassName(isSelected)}>
      {text}
    </li>
  )
}

function buildCategoriesClassName(className?: string): string {
  let result = styles.categories
  if (className)
    result += ` ${className}`
  return result
}

function buildCategoryClassName(isSelected: boolean): string {
  let result = styles.category
  if (isSelected)
    result += ` ${styles.selected}`
  return result
}
