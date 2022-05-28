import React, { useEffect, useRef } from "react"
import { autorender } from "../autorender"
import { Spinner } from "../Spinner"
import * as model from "./WebRenderer.model"
import styles from "./WebRenderer.module.scss"

interface WebRendererProps {
    model: model.WebRenderer
    isConnected: boolean
}

export function WebRenderer({ model, isConnected }: WebRendererProps): JSX.Element {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (ref.current)
            model.mount(ref.current)
        return () => model.unmount()
    }, [model, isConnected])

    return autorender(() => {
        if (!isConnected)
            return (
                <div className={styles.loadingPlaceholder}>
                    <Spinner className={styles.loadingSpinner} />
                    <p className={styles.loadingText}>Waiting for backend</p>
                </div>
            )
        return <div className={styles.webRenderer} ref={ref} />
    }, [model, isConnected])
}
