import React from "react";
import { IconType } from "react-icons";
import { FaCode, FaCog, FaDesktop, FaTasks } from "react-icons/fa";
import { Models } from "../models";
import styles from "./Activities.module.css";
import autorender from "./autorender";

interface ActivityBarProps {
  model: Models.Activities;
}

function button(model: Models.Activities, activity: Models.Activity, Icon: IconType): JSX.Element {
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
        {button(model, Models.Activity.Tasks, FaTasks)}
        {button(model, Models.Activity.Solution, FaCode)}
        {button(model, Models.Activity.Demo, FaDesktop)}
      </div>

      <div className={styles.bottomButtons}>{button(model, Models.Activity.Settings, FaCog)}</div>
    </div>
  ));
}
