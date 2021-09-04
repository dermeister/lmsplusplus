import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Dropdown } from "../Dropdown"
import { Field } from "../Field"

interface PreferencesProps {
  model: models.Options
}

const themes = [
  { value: "Dark", title: "Dark", key: 0 },
  { value: "Light", title: "Light", key: 1 }
]

export function Preferences({ model }: PreferencesProps): JSX.Element {
  return autorender(() => (
    <section>
      <Field label="Theme">
        <Dropdown
          selectedItemIndex={model.darkMode ? 0 : 1}
          items={themes}
          onChange={i => model.setDarkMode(i === 0)}
        />
      </Field>
    </section>
  ), [model])
}
