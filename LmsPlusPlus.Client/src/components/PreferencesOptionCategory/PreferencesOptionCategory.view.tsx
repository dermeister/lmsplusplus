import React from "react"
import { autorender } from "../autorender"
import { Dropdown } from "../Dropdown"
import { Field } from "../Field"
import * as model from "./PreferencesOptionCategory.model"

const themes = [
    { value: "Dark", title: "Dark" },
    { value: "Light", title: "Light" }
]

interface PreferencesOptionCategoryProps {
    category: model.PreferencesOptionCategory
}

export function PreferencesOptionCategory({ category }: PreferencesOptionCategoryProps): JSX.Element {
    return autorender(() => (
        <Field label="Theme">
            <Dropdown selectedValue={category.theme}
                items={themes}
                onValueChange={i => category.setTheme(i).catch(() => { })}
                createPlaceholder={() => category.theme} />
        </Field>
    ), [category])
}
