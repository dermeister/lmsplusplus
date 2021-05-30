import React from "react";
import { FaChevronRight } from "react-icons/fa";

import autorender from "./autorender";
import { ExplorerGroupNode, ExplorerModel, ExplorerNode } from "../models/ExplorerModel";
import { useContextMenu } from "./WindowManager";
import { ContextMenu } from "./ContextMenu";
import { ContextMenuModel } from "../models/ContextMenuModel";
import styles from "./Explorer.module.css";

interface ExplorerProps {
  model: ExplorerModel;
}

const OFFSET_BASE = 16;
const OFFSET_DELTA = 7;

function contextMenu(model: ContextMenuModel): JSX.Element {
  return (
    <ContextMenu model={model}>
      <p>Item 1</p>
      <p>Item 2</p>
      <p>Item 3</p>
      <p>Item 4</p>
    </ContextMenu>
  );
}

function Node({ node, offset }: { node: ExplorerNode; offset: number }): JSX.Element {
  const onContextMenu = useContextMenu(node.contextMenu);

  return autorender(() => (
    <li>
      <p
        onContextMenu={onContextMenu}
        onClick={() => node.click()}
        style={{ paddingLeft: offset }}
        className={styles.node}
      >
        {renderArrowIfGroupNode(node)}
        {node.title}
        {contextMenu(node.contextMenu)}
      </p>

      {renderChildrenIfGroupNode(node, offset + OFFSET_DELTA)}
    </li>
  ));
}

function renderArrowIfGroupNode(node: ExplorerNode): JSX.Element | undefined {
  if (node instanceof ExplorerGroupNode) {
    let className = styles.arrow;
    if (node.isOpened) className += ` ${styles.arrowOpened}`;

    return <FaChevronRight size={10} className={className} />;
  }
}

function renderChildrenIfGroupNode(node: ExplorerNode, offset: number): JSX.Element | undefined {
  if (node instanceof ExplorerGroupNode && node.isOpened) {
    return (
      <ul className={styles.list}>
        {node.children.map((c) => (
          <Node key={c.key} node={c} offset={offset + OFFSET_DELTA} />
        ))}
      </ul>
    );
  }
}

export function Explorer({ model }: ExplorerProps): JSX.Element {
  return autorender(() => (
    <ul className={styles.list}>
      {model.roots.map((r) => (
        <Node key={r.key} node={r} offset={OFFSET_BASE} />
      ))}
    </ul>
  ));
}
