import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Dropdown } from "../Dropdown"
import { Field } from "../Field"
import { PreferencesOptionCategory } from "./PreferencesOptionCategory"

interface PreferencesViewProps {
    model: PreferencesOptionCategory
}

const themes = [
    { value: "Dark", title: "Dark" },
    { value: "Light", title: "Light" }
]

export function PreferencesOptionCategoryView({ model }: PreferencesViewProps): JSX.Element {
    return autorender(() => (
        <Field label="Theme">
            <Dropdown selectedValue={model.optionsService.darkMode ? "Dark" : "Light"}
                items={themes}
                onValueChange={i => model.optionsService.setDarkMode(i === "Dark")}
                createPlaceholder={() => model.optionsService.darkMode ? "Dark" : "Light"} />
        </Field>
    ), [model])
}
