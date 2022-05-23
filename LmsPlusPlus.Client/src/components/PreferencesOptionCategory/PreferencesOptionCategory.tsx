import React from "react"
import { IOptionCategory } from "../IOptionCategory"
import { IOptionsService } from "../Options"
import { PreferencesOptionCategoryView } from "./PreferencesOptionCategoryView"

export class PreferencesOptionCategory implements IOptionCategory {
    readonly optionsService: IOptionsService

    constructor(optionsService: IOptionsService) {
        this.optionsService = optionsService
    }

    render(): JSX.Element {
        return <PreferencesOptionCategoryView model={this} />
    }
}
