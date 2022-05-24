import React from "react"
import { autorender } from "../autorender"
import { Dropdown } from "../Dropdown"
import { Field } from "../Field"
import { PreferencesOptionCategoryModel } from "./PreferencesOptionCategory.model"

interface PreferencesViewProps {
    model: PreferencesOptionCategoryModel
}

const themes = [
    { value: "Dark", title: "Dark" },
    { value: "Light", title: "Light" }
]

export function PreferencesOptionCategoryView({ model }: PreferencesViewProps): JSX.Element {
    return autorender(() => (
        <Field label="Theme">
            <Dropdown selectedValue={model.darkMode ? "Dark" : "Light"}
                items={themes}
                onValueChange={i => model.setDarkMode(i === "Dark")}
                createPlaceholder={() => model.darkMode ? "Dark" : "Light"} />
        </Field>
    ), [model])
}
