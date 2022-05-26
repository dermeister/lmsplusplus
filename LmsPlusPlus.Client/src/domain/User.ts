export class User {
    static readonly default = User.createDefaultUser()
    readonly firstName: string
    readonly lastName: string

    constructor(firstName: string, lastName: string) {
        this.firstName = firstName
        this.lastName = lastName
    }

    private static createDefaultUser(): User { return new User("", "") }
}
