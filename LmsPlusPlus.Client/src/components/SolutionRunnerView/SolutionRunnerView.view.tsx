import React from "react"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { ServiceViewsExplorer } from "../ServicesViewExplorer"
import { Spinner } from "../Spinner"
import { combineClassNames, maybeValue } from "../utils"
import { IRenderer } from "./IRenderer"
import { SolutionRunnerView } from "./SolutionRunnerView.model"
import styles from "./SolutionRunnerView.module.scss"

interface SolutionRunnerProps {
    model: SolutionRunnerView
    serviceViewsExplorer: ServiceViewsExplorer | null
}

export function SolutionRunnerSidePanelContent({ model, serviceViewsExplorer }: SolutionRunnerProps): JSX.Element {
    return autorender(() => {
        let body: JSX.Element = <></>
        if (serviceViewsExplorer)
            body = serviceViewsExplorer.render()
        else
            body = <p className={styles.sidePanelLoadingPlaceholder}>Wait for application to load.</p>
        return (
            <div className={styles.sidePanelContent}>
                {body}
                <Button className={styles.stopButton} variant="danger" onClick={() => model.stopSolution()}>Stop</Button>
            </div>
        )
    }, [model, serviceViewsExplorer])
}

interface SolutionRunnerMainPanelContentProps {
    renderers: IRenderer[] | null
    currentRenderer: IRenderer | null
}

export function SolutionRunnerMainPanelContent({ renderers, currentRenderer }: SolutionRunnerMainPanelContentProps): JSX.Element {
    return autorender(() => {
        if (!(renderers && currentRenderer))
            return (
                <div className={styles.mainPanelLoadingPlaceholder}>
                    <Spinner className={styles.loadingSpinner} />
                    <p className={styles.loadingText}>Wait for application to load</p>
                </div>
            )
        return (
            <>
                {renderers.map((r, i) => {
                    const className = combineClassNames(styles.mainPanelContent, maybeValue(styles.hidden, currentRenderer !== r))
                    return <div className={className} key={i}>{r.render()}</div>
                })}
            </>
        )
    }, [renderers, currentRenderer])
}

