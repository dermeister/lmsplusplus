import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Dropdown } from "../Dropdown"
import { Field } from "../Field"

interface PreferencesProps {
  model: models.Options
}

const darkTheme = {
  value: "Dark",
  title: "Dark",
  key: 1
}

const lightTheme = {
  value: "Light",
  title: "Light",
  key: 1
}

export function Preferences({ model }: PreferencesProps): JSX.Element {
  return autorender(() => (
    <>
      <Field label="Theme">
        <Dropdown
          selectedItem={model.darkMode ? darkTheme : lightTheme}
          items={[darkTheme, lightTheme]}
          onChange={v => model.setDarkMode(v === darkTheme.value)}
        />
      </Field>
    </>
  ), [model])
}
