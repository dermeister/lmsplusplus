import React from "react"
import { IOptionCategory } from "../IOptionCategory"
import { IOptionsService } from "../Options"
import { VcsOptionCategoryView } from "./VcsOptionCategoryView"

export class VcsOptionCategory implements IOptionCategory {
    readonly optionsService: IOptionsService

    constructor(optionsService: IOptionsService) {
        this.optionsService = optionsService
    }

    render(): JSX.Element {
        return <VcsOptionCategoryView model={this} />
    }
}
