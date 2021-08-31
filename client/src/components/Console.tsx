import React, { useEffect, useRef } from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"
import "./Console.module.scss"

export function Console(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let terminal: Terminal | undefined
    let fitAddon: FitAddon | undefined
    if (ref.current) {
      const d = document.createElement("div")
      terminal = new Terminal({ rendererType: "canvas" })
      fitAddon = new FitAddon()
      terminal.writeln("Dungeon master")
      terminal.loadAddon(fitAddon)
      terminal.open(d)
      ref.current.append(d)
      setTimeout(() => {
        ref.current!.removeChild(d)
        setTimeout(() => {
          terminal!.writeln("Fuck")
          ref.current!.append(d)
        }, 1000)
      }, 1000)
      // fitAddon.fit()
    }
    return () => {
      terminal?.dispose()
      fitAddon?.dispose()
    }
  }, [])

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />
}
