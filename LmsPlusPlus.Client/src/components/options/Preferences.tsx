import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Dropdown } from "../Dropdown"
import { Field } from "../Field"

interface PreferencesProps {
    model: models.Options
}

const themes = [
    { value: "Dark", title: "Dark" },
    { value: "Light", title: "Light" }
]

export function Preferences({ model }: PreferencesProps): JSX.Element {
    return autorender(() => (
        <Field label="Theme">
            <Dropdown
                selectedValue={model.darkMode ? "Dark" : "Light"}
                items={themes}
                onValueChange={i => model.setDarkMode(i === "Dark")}
            />
        </Field>
    ), [model])
}
