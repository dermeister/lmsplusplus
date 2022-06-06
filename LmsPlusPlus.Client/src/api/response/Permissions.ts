export interface Permissions {
    readonly canCreateTask: boolean
    readonly canUpdateTask: boolean
    readonly canDeleteTask: boolean
    readonly hasVcsAccounts: boolean
    readonly canUpdateUser: boolean
    readonly canCreateSolution: boolean
    readonly canDeleteSolution: boolean
    readonly canViewAllSolutions: boolean
}
