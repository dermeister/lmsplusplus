import React from "react";
import { Models } from "../models";
import styles from "./AppScreen.module.css";
import autorender from "./autorender";
import { Side, SidePanel } from "./SidePanel";
import { TasksView } from "./tasks/TasksView";
import { ViewBar } from "./ViewBar";
import { DemoView } from "./views/DemoView";
import { OptionsView } from "./views/OptionsView";
import { SolutionsView } from "./views/SolutionsView";

interface AppScreenProps {
  model: Models.App;
}

function content(model: Models.Views): JSX.Element | undefined {
  if (model.tasks === model.active) {
    return <TasksView model={model.tasks} />;
  }

  if (model.solutions === model.active) {
    return <SolutionsView model={model.solutions} />;
  }

  if (model.demo === model.active) {
    return <DemoView model={model.demo} />;
  }

  if (model.options === model.active) {
    return <OptionsView model={model.options} />;
  }
}

export function AppScreen({ model }: AppScreenProps): JSX.Element {
  return autorender(() => (
    <>
      <ViewBar model={model.views} />
      <div className={styles.content}>{content(model.views)}</div>
    </>
  ));
}

interface MainPanelProps {
  children?: React.ReactNode;
}

AppScreen.MainPanel = function MainPanel({ children }: MainPanelProps): JSX.Element {
  return <div className={styles.mainPanel}>{children}</div>;
};

interface SidePanelProps {
  model: Models.SidePanel;
  children?: React.ReactNode;
}

AppScreen.LeftPanel = function LeftPanel({ model, children }: SidePanelProps): JSX.Element {
  return (
    <SidePanel model={model} side={Side.Left}>
      {children}
    </SidePanel>
  );
};

AppScreen.RightPanel = function RightPanel({ model, children }: SidePanelProps): JSX.Element {
  return (
    <SidePanel model={model} side={Side.Right}>
      {children}
    </SidePanel>
  );
};
