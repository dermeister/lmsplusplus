import React from "react";
import { Models } from "../../models";
import { AppScreen } from "../AppScreen";
import autorender from "../autorender";
import { Explorer } from "../Explorer";

interface TasksViewProps {
  model: Models.TasksView;
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  return autorender(() => (
    <>
      <AppScreen.LeftPanel model={model.leftPanel}>
        <Explorer model={model.explorer} />
      </AppScreen.LeftPanel>

      <AppScreen.MainPanel>Tasks</AppScreen.MainPanel>
    </>
  ));
}
