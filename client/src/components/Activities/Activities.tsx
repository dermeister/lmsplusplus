import React from "react";

import autorender from "../autorender";
import { Activity, ActivitiesModel } from "./ActivitiesModel";
import styles from "./Activities.module.css";

interface ActivityBarProps {
  model: ActivitiesModel;
}

function button(
  model: ActivitiesModel,
  activity: Activity,
  title: string
): JSX.Element {
  let className = styles.activityButton;
  if (model.current === activity) className += ` ${styles.selected}`;

  return (
    <button onClick={() => model.setActivity(activity)} className={className}>
      {title}
    </button>
  );
}

export function Activities({ model }: ActivityBarProps): JSX.Element {
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
