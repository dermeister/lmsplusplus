import React from "react"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Spinner } from "../Spinner"
import { SolutionRunnerView } from "./SolutionRunnerView.model"
import styles from "./SolutionRunnerView.module.scss"

interface SolutionRunnerViewProps {
    view: SolutionRunnerView
}

export function SolutionRunnerSidePanelContent({ view }: SolutionRunnerViewProps): JSX.Element {
    return autorender(() => {
        let body: JSX.Element
        if (view.serviceViewsExplorer)
            body = view.serviceViewsExplorer.render()
        else if (view.unableToStartApplication)
            body = <div className={styles.sidePanelText}>Unable to start application.</div>
        else
            body = <p className={styles.sidePanelText}>Wait for application to load.</p>
        return (
            <div className={styles.sidePanelContent}>
                {body}
                <Button className={styles.closeButton} variant="danger" onClick={() => view.close()}>Close</Button>
            </div>
        )
    }, [view])
}

export function SolutionRunnerMainPanelContent({ view }: SolutionRunnerViewProps): JSX.Element {
    return autorender(() => {
        let content: JSX.Element
        if (view.unableToStartApplication)
            content = <p className={styles.mainPanelContentText}>Unable to start application.</p>
        else if (!(view.renderers && view.currentRenderer))
            content = (
                <div className={styles.mainPanelContentText}>
                    <Spinner className={styles.loadingSpinner} />
                    <p>Wait for application to load.</p>
                </div>
            )
        else
            content = view.currentRenderer.render()
        return <div className={styles.mainPanelContent}>{content}</div>
    }, [view])
}
