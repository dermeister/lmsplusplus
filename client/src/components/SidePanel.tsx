import React from "react";
import { FaTimes } from "react-icons/fa";
import { Models } from "../models";
import autorender from "./autorender";
import styles from "./SidePanel.module.css";

export enum Side {
  Left,
  Right,
}

interface SidePanelProps {
  model: Models.SidePanel;
  side: Side;
  children?: React.ReactNode;
}

export function SidePanel(props: SidePanelProps): JSX.Element {
  const { model, side, children } = props;

  return autorender(() => {
    if (model.opened) {
      return (
        <div className={styles.sidePanel}>
          <header className={styles.header}>
            <h2 className={styles.title}>{model.title}</h2>
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
        {model.title}
      </button>
    );
  });
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
