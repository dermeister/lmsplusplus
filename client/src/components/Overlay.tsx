import React, { useEffect, useRef } from "react"
import styles from "./Overlay.module.css"

interface OverlayProps {
  children: React.ReactNode
  className?: string
  beforeClick?(): void
  afterClick?(): void
}

export function Overlay(props: OverlayProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.addEventListener("focusin", onFocusIn, true)
    focusContent(ref.current)

    return () => document.removeEventListener("focusin", onFocusIn, true)
  }, [])

  function onFocusIn({ target }: FocusEvent): void {
    if (target instanceof Node && !ref.current?.contains(target)) focusContent(ref.current)
  }

  function onMouseDown(e: React.MouseEvent): void {
    if (e.target === ref.current) {
      props.beforeClick?.()
      setTimeout(() => props.afterClick?.(), 0)
    }
  }

  function stopEvent(e: React.SyntheticEvent) {
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={stopEvent}
      onClick={stopEvent}
      onMouseEnter={stopEvent}
      onMouseOver={stopEvent}
      onMouseMove={stopEvent}
      onMouseOut={stopEvent}
      onMouseLeave={stopEvent}
      onScroll={stopEvent}
      onContextMenu={stopEvent}
      className={buildClassName(props)}
      tabIndex={-1}
    >
      {props.children}
    </div>
  )
}

function focusContent(overlay: HTMLDivElement | null): void {
  const focusableChild = overlay?.querySelector(`:enabled:not([tabindex="-1"])`)
  if (focusableChild instanceof HTMLElement) {
    focusableChild.focus()
  } else {
    overlay?.focus()
  }
}

function buildClassName(props: OverlayProps): string {
  let className = styles.overlay
  if (props.className !== undefined) className += ` ${props.className}`

  return className
}
