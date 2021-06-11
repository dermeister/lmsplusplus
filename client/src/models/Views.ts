import { cached, ObservableObject, reaction, transaction, unobservable } from "reactronic";
import { DemoView } from "./views/DemoView";
import { OptionsView } from "./views/OptionsView";
import { SolutionsView } from "./views/SolutionsView";
import { TasksView } from "./views/TasksView";

export type View = TasksView | DemoView | SolutionsView | OptionsView;

export class Views extends ObservableObject {
  @unobservable public readonly tasks = new TasksView();
  @unobservable public readonly solutions = new SolutionsView();
  @unobservable public readonly demo = new DemoView();
  @unobservable public readonly options = new OptionsView();
  private _active: View = this.tasks;

  @cached
  public get active(): View {
    return this._active;
  }

  @transaction
  public activate(view: View): void {
    this._active = view;
  }

  @reaction
  private syncSidePanels(): void {
    const views = [this.tasks, this.solutions, this.demo, this.options];
    const { opened } = this._active.leftPanel;

    for (const view of views) {
      const { leftPanel } = view;
      opened ? leftPanel.open() : leftPanel.close();
    }
  }
}
