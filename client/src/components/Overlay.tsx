import React, { useEffect, useRef } from "react"
import styles from "./Overlay.module.scss"

interface OverlayProps {
  trapFocus?: boolean
  children: React.ReactNode
  onClick?(): void
  onScroll?(): void
}

export function Overlay(props: OverlayProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    addDocumentEventListeners()
    focusContent(ref.current)
    return () => removeDocumentEventListeners()
  }, [])

  function addDocumentEventListeners(): void {
    document.addEventListener("mousedown", onMouseDown, true)
    document.addEventListener("scroll", onScroll, true)
    if (props.trapFocus) {
      document.addEventListener("mouseup", stopEvent, true)
      document.addEventListener("click", stopEvent, true)
      document.addEventListener("mouseenter", stopEvent, true)
      document.addEventListener("mouseover", stopEvent, true)
      document.addEventListener("mousemove", stopEvent, true)
      document.addEventListener("mouseout", stopEvent, true)
      document.addEventListener("mouseleave", stopEvent, true)
      document.addEventListener("focusin", onFocusIn, true)
      document.addEventListener("contextmenu", stopEvent, true)
    }
  }

  function removeDocumentEventListeners(): void {
    document.removeEventListener("mousedown", onMouseDown, true)
    document.removeEventListener("scroll", onScroll, true)
    if (props.trapFocus) {
      document.removeEventListener("mouseup", stopEvent, true)
      document.removeEventListener("click", stopEvent, true)
      document.removeEventListener("mouseenter", stopEvent, true)
      document.removeEventListener("mouseover", stopEvent, true)
      document.removeEventListener("mousemove", stopEvent, true)
      document.removeEventListener("mouseout", stopEvent, true)
      document.removeEventListener("mouseleave", stopEvent, true)
      document.removeEventListener("focusin", onFocusIn, true)
      document.removeEventListener("contextmenu", stopEvent, true)
    }
  }

  function onMouseDown({ target }: MouseEvent): void {
    if (target === ref.current || target instanceof Node && !ref.current?.contains(target))
      props.onClick?.()
  }

  function onScroll({ target }: Event): void {
    if (target === ref.current || target instanceof Node && !ref.current?.contains(target))
      props.onScroll?.()
  }

  function onFocusIn({ target }: FocusEvent): void {
    if (target instanceof Node && ref.current && !ref.current.contains(target))
      focusContent(ref.current)
  }

  function stopEvent(e: Event) {
    if (e.target instanceof Node && !ref.current?.contains(e.target)) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  return <div ref={ref} className={buildClassName(props)} tabIndex={-1}>{props.children}</div>
}

function focusContent(overlay: HTMLDivElement | null): void {
  const focusableChild = overlay?.querySelector(":enabled:not([tabindex=\"-1\"])")
  if (focusableChild instanceof HTMLElement)
    focusableChild.focus()
  else
    overlay?.focus()
}

function buildClassName(props: OverlayProps): string {
  let result = styles.overlay
  if (props.trapFocus)
    result += ` ${styles.trapFocusOverlay}`
  return result
}
