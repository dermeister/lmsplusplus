import React, { useEffect, useRef } from "react"
import * as model from "./ConsoleRenderer.model"
import styles from "./ConsoleRenderer.module.scss"

interface ConsoleRendererProps {
    model: model.ConsoleRenderer
}

export function ConsoleRenderer({ model }: ConsoleRendererProps): JSX.Element {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (ref.current)
            model.mount(ref.current)
        return () => model.unmount()
    }, [model])

    return <div className={styles.consoleRenderer} ref={ref} />
}
