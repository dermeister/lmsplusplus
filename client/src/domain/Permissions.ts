export class Permissions {
  static readonly default = Permissions.createDefaultPermissions()
  static readonly student = Permissions.createStudentPermissions()
  static readonly teacher = Permissions.createTeacherPermissions()
  readonly canCreateTask: boolean
  readonly canUpdateTask: boolean
  readonly canDeleteTask: boolean
  readonly canUpdateVcsConfiguration: boolean
  readonly canUpdateUser: boolean

  constructor(canCreateTask: boolean,
              canUpdateTask: boolean,
              canDeleteTask: boolean,
              canUpdateVcsConfiguration: boolean,
              canUpdateUser: boolean) {
    this.canCreateTask = canCreateTask
    this.canUpdateTask = canUpdateTask
    this.canDeleteTask = canDeleteTask
    this.canUpdateVcsConfiguration = canUpdateVcsConfiguration
    this.canUpdateUser = canUpdateUser
  }

  private static createDefaultPermissions(): Permissions {
    return new Permissions(false, false, false, false, true)
  }

  private static createStudentPermissions(): Permissions {
    return new Permissions(false, false, false, true, true)
  }

  private static createTeacherPermissions(): Permissions {
    return new Permissions(true, true, true, false, true)
  }
}
