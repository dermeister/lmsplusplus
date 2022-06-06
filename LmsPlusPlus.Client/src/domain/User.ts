export class User {
    static readonly default = User.createDefaultUser()
    readonly id: number
    readonly firstName: string
    readonly lastName: string

    constructor(id: number, firstName: string, lastName: string) {
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
    }

    private static createDefaultUser(): User { return new User(0, "", "") }
}
