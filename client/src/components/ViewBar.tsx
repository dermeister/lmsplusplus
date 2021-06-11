import React from "react";
import { IconType } from "react-icons";
import { FaCode, FaCog, FaDesktop, FaTasks } from "react-icons/fa";
import { Models } from "../models";
import styles from "./ViewBar.module.css";
import autorender from "./autorender";

interface ViewBarProps {
  model: Models.Views;
}

function button(model: Models.Views, view: Models.View, Icon: IconType): JSX.Element {
  let className = styles.viewButton;
  if (model.active === view) className += ` ${styles.selected}`;

  return (
    <button onClick={() => model.activate(view)} className={className}>
      <Icon size={20} />
    </button>
  );
}

export function ViewBar({ model }: ViewBarProps): JSX.Element {
  return autorender(() => (
    <div className={styles.viewBar}>
      <div className={styles.topButtons}>
        {button(model, model.tasks, FaTasks)}
        {button(model, model.solutions, FaCode)}
        {button(model, model.demo, FaDesktop)}
      </div>

      <div className={styles.bottomButtons}>{button(model, model.options, FaCog)}</div>
    </div>
  ));
}
