import React from "react";
import { FaTimes } from "react-icons/fa";

import autorender from "./autorender";
import { SidePanelModel } from "../models/SidePanelModel";
import styles from "./SidePanel.module.css";

export enum Side {
  Left,
  Right,
}

interface SidePanelProps {
  model: SidePanelModel;
  title: string;
  side: Side;
  children?: React.ReactNode;
}

function buildClassName(position: Side): string {
  let className = styles.sidePanelToggle;
  switch (position) {
    case Side.Left:
      className += ` ${styles.sidePanelToggleLeft}`;
      break;

    case Side.Right:
      className += ` ${styles.sidePanelToggleRight}`;
      break;
  }

  return className;
}

export function SidePanel(props: SidePanelProps): JSX.Element {
  const { model, title, side, children } = props;

  return autorender(() => {
    if (model.opened) {
      return (
        <div className={styles.sidePanel}>
          <header className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button onClick={() => model.close()} className={styles.close}>
              <FaTimes />
            </button>
          </header>

          {children}
        </div>
      );
    }

    return (
      <button onClick={() => model.open()} className={buildClassName(side)}>
        {title}
      </button>
    );
  });
}
