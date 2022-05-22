import React from "react";
import { unobservable } from "reactronic";
import { IOptionCategory } from "../IOptionCategory";
import { IOptionsService } from "../IOptionsService";
import { PreferencesOptionCategoryView } from "./PreferencesOptionCategoryView";

export class PreferencesOptionCategory implements IOptionCategory {
    readonly optionsService: IOptionsService

    constructor(optionsService: IOptionsService) {
        this.optionsService = optionsService;
    }

    render(): JSX.Element {
        return <PreferencesOptionCategoryView model={this} />;
    }
}
