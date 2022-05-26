export class Permissions {
    static readonly default = Permissions.createDefaultPermissions()
    readonly canCreateTask: boolean
    readonly canUpdateTask: boolean
    readonly canDeleteTask: boolean
    readonly canUpdateVcsConfiguration: boolean
    readonly canUpdateUser: boolean
    readonly canCreateSolution: boolean
    readonly canDeleteSolution: boolean

    constructor(canCreateTask: boolean, canUpdateTask: boolean, canDeleteTask: boolean,
        canUpdateVcsConfiguration: boolean, canUpdateUser: boolean, canCreateSolution: boolean, canDeleteSolution: boolean) {
        this.canCreateTask = canCreateTask
        this.canUpdateTask = canUpdateTask
        this.canDeleteTask = canDeleteTask
        this.canUpdateVcsConfiguration = canUpdateVcsConfiguration
        this.canUpdateUser = canUpdateUser
        this.canCreateSolution = canCreateSolution
        this.canDeleteSolution = canDeleteSolution
    }

    private static createDefaultPermissions(): Permissions {
        return new Permissions(false, false, false, false, false, false, false)
    }
}
