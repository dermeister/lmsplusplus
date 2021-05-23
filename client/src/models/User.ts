import { ObservableObject, Transaction } from "reactronic";

export class User extends ObservableObject {
  public static deserialize(serializedUser: string): User {
    return Transaction.run(() => new User());
  }
}
