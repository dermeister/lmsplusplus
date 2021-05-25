import { cached, ObservableObject, transaction } from "reactronic";

export enum Activity {
  Tasks,
  Solution,
  Demo,
  Settings,
}

export class ActivitiesModel extends ObservableObject {
  private _current: Activity = Activity.Tasks;

  @cached
  public get current(): Activity {
    return this._current;
  }

  @transaction
  public setActivity(activity: Activity): void {
    this._current = activity;
  }
}
