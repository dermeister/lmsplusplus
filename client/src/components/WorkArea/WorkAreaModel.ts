import {
  ObservableObject,
  reaction,
  transaction,
  unobservable,
} from "reactronic";
import { ActivitiesModel } from "../Activities";
import { SidePanelModel } from "../SidePanel/SidePanelModel";

export class WorkAreaModel extends ObservableObject {
  @unobservable public readonly leftSidePanel = new SidePanelModel();
  @unobservable public readonly rightSidePanel = new SidePanelModel();
  @unobservable private readonly activities;

  public constructor(activities: ActivitiesModel) {
    super();
    this.activities = activities;
  }

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
