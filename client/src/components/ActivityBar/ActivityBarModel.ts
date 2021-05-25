import { cached, ObservableObject, transaction } from "reactronic";

export enum Activity {
  Tasks,
  Solution,
  Demo,
  Settings,
}

export class ActivityBarModel extends ObservableObject {
  private _activity: Activity = Activity.Tasks;

  @cached
  public get activity(): Activity {
    return this._activity;
  }

  @transaction
  public setActivity(activity: Activity): void {
    this._activity = activity;
  }
}
