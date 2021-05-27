import React from "react";
import { FaChevronRight } from "react-icons/fa";

import autorender from "./autorender";
import { ExplorerGroupNode, ExplorerModel, ExplorerNode } from "../models/ExplorerModel";
import styles from "./Explorer.module.css";

interface ExplorerProps {
  model: ExplorerModel;
}

const OFFSET_BASE = 16;
const OFFSET_DELTA = 7;

function renderNode(node: ExplorerNode, offset: number): JSX.Element {
  return (
    <li key={node.key}>
      <p onClick={() => node.click()} style={{ paddingLeft: offset }} className={styles.node}>
        {tryRenderArrow(node)}
        {node.title}
      </p>

      {tryRenderChildren(node, offset + OFFSET_DELTA)}
    </li>
  );
}

function tryRenderArrow(node: ExplorerNode): JSX.Element | undefined {
  if (node.isGroup) {
    const groupNode = node as ExplorerGroupNode;

    let className = styles.arrow;
    if (groupNode.isOpened) className += ` ${styles.arrowOpened}`;

    return <FaChevronRight size={10} className={className} />;
  }
}

function tryRenderChildren(node: ExplorerNode, padding: number): JSX.Element | undefined {
  if (node.isGroup) {
    const groupNode = node as ExplorerGroupNode;

    if (groupNode.isOpened) {
      const nodes = groupNode.children.map((c) => renderNode(c, padding + OFFSET_DELTA));
      return <ul className={styles.list}>{nodes}</ul>;
    }
  }
}

export function Explorer({ model }: ExplorerProps): JSX.Element {
  return autorender(() => (
    <ul className={styles.list}>{model.roots.map((r) => renderNode(r, OFFSET_BASE))}</ul>
  ));
}
