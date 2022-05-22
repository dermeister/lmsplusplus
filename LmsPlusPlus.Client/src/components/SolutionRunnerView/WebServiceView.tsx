import React, { useEffect, useRef } from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Spinner } from "../Spinner"
import { WebServiceViewModel } from "./service/WebServiceView"
import styles from "./WebServiceView.module.scss"

interface WebServiceViewProps {
    model: WebServiceViewModel
}

export function WebServiceView({ model }: WebServiceViewProps): JSX.Element {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (ref.current)
            model.mount(ref.current)
        return () => model.unmount()
    }, [model, model.isBackendLoading])

    return autorender(() => {
        if (model.isBackendLoading)
            return (
                <div className={styles.loadingPlaceholder}>
                    <Spinner className={styles.loadingSpinner} />
                    <p className={styles.loadingText}>Waiting for backend</p>
                </div>
            )
        return <div ref={ref} />
    }, [model])
}
