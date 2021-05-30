import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { Models } from "../models";
import autorender from "./autorender";
import { ContextMenu } from "./ContextMenu";
import styles from "./Explorer.module.css";
import { useContextMenu } from "./WindowManager";

interface NodeProps {
  node: Models.ExplorerNode;
  offset: number;
}

interface ExplorerProps {
  model: Models.Explorer;
}

function buildNodeClassName(node: Models.ExplorerNode): string {
  let className = styles.node;
  if (node.contextMenu.isOpened) className += ` ${styles.contextMenuOpened}`;

  return className;
}

function contextMenu(model: Models.ContextMenu): JSX.Element {
  return (
    <ContextMenu model={model}>
      <p>Item 1</p>
      <p>Item 2</p>
      <p>Item 3</p>
      <p>Item 4</p>
    </ContextMenu>
  );
}

function Node({ node, offset }: NodeProps): JSX.Element {
  const onContextMenu = useContextMenu(node.contextMenu);

  return autorender(() => (
    <li>
      <p
        onContextMenu={onContextMenu}
        onClick={() => node.click()}
        style={{ paddingLeft: offset }}
        className={buildNodeClassName(node)}
      >
        {renderArrowIfGroupNode(node)}
        {node.title}
        {contextMenu(node.contextMenu)}
      </p>

      {renderChildrenIfGroupNode(node, offset + Number(styles.offsetDelta))}
    </li>
  ));
}

function renderArrowIfGroupNode(node: Models.ExplorerNode): JSX.Element | undefined {
  if (node instanceof Models.ExplorerGroupNode) {
    let className = styles.arrow;
    if (node.isOpened) className += ` ${styles.arrowOpened}`;

    return <FaChevronRight size={10} className={className} />;
  }
}

function renderChildrenIfGroupNode(
  node: Models.ExplorerNode,
  offset: number
): JSX.Element | undefined {
  if (node instanceof Models.ExplorerGroupNode && node.isOpened) {
    return (
      <ul className={styles.list}>
        {node.children.map((c) => (
          <Node key={c.key} node={c} offset={offset + Number(styles.offsetDelta)} />
        ))}
      </ul>
    );
  }
}

export function Explorer({ model }: ExplorerProps): JSX.Element {
  return autorender(() => (
    <ul className={styles.list}>
      {model.roots.map((r) => (
        <Node key={r.key} node={r} offset={Number(styles.offsetBase)} />
      ))}
    </ul>
  ));
}
