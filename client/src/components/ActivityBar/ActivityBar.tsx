import React from "react";

import autorender from "../autorender";
import { Activity, ActivityBarModel } from "./ActivityBarModel";
import styles from "./ActivityBar.module.css";

interface ActivityBarProps {
  model: ActivityBarModel;
}

function button(
  model: ActivityBarModel,
  activity: Activity,
  title: string
): JSX.Element {
  let className = styles.activityButton;
  if (model.activity === activity) className += ` ${styles.selected}`;

  return (
    <button onClick={() => model.setActivity(activity)} className={className}>
      {title}
    </button>
  );
}

export function ActivityBar({ model }: ActivityBarProps): JSX.Element {
  return autorender(() => (
    <div className={styles.activityBar}>
      <div className={styles.topButtons}>
        {button(model, Activity.Tasks, "T")}
        {button(model, Activity.Solution, "S")}
        {button(model, Activity.Demo, "D")}
      </div>

      <div className={styles.bottomButtons}>
        {button(model, Activity.Settings, "S")}
      </div>
    </div>
  ));
}
