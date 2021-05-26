import {
  ObservableObject,
  reaction,
  transaction,
  unobservable,
} from "reactronic";

import { Auth } from "../services/Auth";
import { SignInModel } from "./SignInModel";
import { ActivitiesModel } from "./ActivitiesModel";
import { SidePanelModel } from "./SidePanelModel";

export class AppModel extends ObservableObject {
  @unobservable public readonly auth = new Auth("user");
  @unobservable public readonly signIn = new SignInModel(this.auth);
  @unobservable public readonly activities = new ActivitiesModel();
  @unobservable public readonly leftSidePanel = new SidePanelModel();

  @transaction
  public hideLeftSidePanel(): void {
    this.leftSidePanel.close();
  }

  @reaction
  private showLeftSidePanelOnActivitySwitch(): void {
    this.activities.current;
    this.leftSidePanel.open();
  }
}
