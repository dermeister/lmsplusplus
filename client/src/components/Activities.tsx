import React from "react";
import { FaTasks, FaCode, FaDesktop, FaCog } from "react-icons/fa";
import { IconType } from "react-icons";

import autorender from "./autorender";
import { Activity, ActivitiesModel } from "../models/ActivitiesModel";
import styles from "./Activities.module.css";

interface ActivityBarProps {
  model: ActivitiesModel;
}

function button(model: ActivitiesModel, activity: Activity, Icon: IconType): JSX.Element {
  let className = styles.activityButton;
  if (model.current === activity) className += ` ${styles.selected}`;

  return (
    <button onClick={() => model.setActivity(activity)} className={className}>
      <Icon size={20} />
    </button>
  );
}

export function Activities({ model }: ActivityBarProps): JSX.Element {
  return autorender(() => (
    <div className={styles.activityBar}>
      <div className={styles.topButtons}>
        {button(model, Activity.Tasks, FaTasks)}
        {button(model, Activity.Solution, FaCode)}
        {button(model, Activity.Demo, FaDesktop)}
      </div>

      <div className={styles.bottomButtons}>{button(model, Activity.Settings, FaCog)}</div>
    </div>
  ));
}
