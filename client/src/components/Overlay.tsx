import React, { useEffect, useRef } from "react";
import styles from "./Overlay.module.css";

interface OverlayProps {
  children: React.ReactNode;
  className?: string;
  onClose(): void;
}

function focusContent(overlay: HTMLDivElement | null): void {
  const focusableChild = overlay?.querySelector(":enabled");
  if (focusableChild instanceof HTMLElement) {
    focusableChild.focus();
  } else {
    overlay?.focus();
  }
}

function buildClassName(props: OverlayProps): string {
  let className = styles.overlay;
  if (props.className !== undefined) className += ` ${props.className}`;

  return className;
}

export function Overlay(props: OverlayProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("focusin", onFocusIn, true);
    focusContent(ref.current);

    return () => document.removeEventListener("focusin", onFocusIn, true);
  }, []);

  function onFocusIn({ target }: FocusEvent): void {
    if (target instanceof Node && !ref.current?.contains(target)) focusContent(ref.current);
  }

  function onMouseDown(e: React.MouseEvent): void {
    e.stopPropagation();
    if (e.target === ref.current) props.onClose?.();
  }

  function stopPropagation(e: React.SyntheticEvent) {
    e.stopPropagation();
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={stopPropagation}
      onClick={stopPropagation}
      onMouseEnter={stopPropagation}
      onMouseOver={stopPropagation}
      onMouseMove={stopPropagation}
      onMouseOut={stopPropagation}
      onMouseLeave={stopPropagation}
      className={buildClassName(props)}
      tabIndex={-1}
    >
      {props.children}
    </div>
  );
}
