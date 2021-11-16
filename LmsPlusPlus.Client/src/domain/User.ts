export class User {
  static readonly default = User.createDefaultUser()

  static deserialize(serializedUser: string): User { return new User() }

  private static createDefaultUser(): User { return new User() }
}
