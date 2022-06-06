export class Permissions {
    static readonly default = Permissions.createDefaultPermissions()
    readonly canCreateTask: boolean
    readonly canUpdateTask: boolean
    readonly canDeleteTask: boolean
    readonly hasVcsAccounts: boolean
    readonly canUpdateUser: boolean
    readonly canCreateSolution: boolean
    readonly canDeleteSolution: boolean
    readonly canViewAllSolutions: boolean

    constructor(canCreateTask: boolean, canUpdateTask: boolean, canDeleteTask: boolean, hasVcsAccounts: boolean, canUpdateUser: boolean,
        canCreateSolution: boolean, canDeleteSolution: boolean, canViewAllSolutions: boolean) {
        this.canCreateTask = canCreateTask
        this.canUpdateTask = canUpdateTask
        this.canDeleteTask = canDeleteTask
        this.hasVcsAccounts = hasVcsAccounts
        this.canUpdateUser = canUpdateUser
        this.canCreateSolution = canCreateSolution
        this.canDeleteSolution = canDeleteSolution
        this.canViewAllSolutions = canViewAllSolutions
    }

    private static createDefaultPermissions(): Permissions {
        return new Permissions(false, false, false, false, false, false, false, false)
    }
}
