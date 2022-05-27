import React from "react"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { ServiceView } from "./ServiceView.model"
import { SolutionRunnerView } from "./SolutionRunner.model"
import styles from "./SolutionRunner.module.scss"

interface SolutionRunnerProps {
    model: SolutionRunnerView
}

export function SolutionRunnerSidePanelContent({ model }: SolutionRunnerProps): JSX.Element {
    return autorender(() => {
        // let body: JSX.Element = <></>
        // if (model.isLoadingApplication)
        //     body = <p className={styles.loadingPlaceholder}>Wait for application to load</p>
        // else if (model.servicesExplorer)
        //     body = <ServicesExplorerView model={model.servicesExplorer} />
        return (
            <div className={styles.sidePanelContent}>
                {/* {body} */}
                <Button className={styles.stopButton} variant="danger" onClick={() => model.stopSolution()}>Stop</Button>
            </div>
        )
    }, [model])
}

interface SolutionRunnerMainPanelContentProps {
    services: ServiceView[] | null
    currentService: ServiceView | null
}

export function SolutionRunnerMainPanelContent({ currentService, services }: SolutionRunnerMainPanelContentProps): JSX.Element {
    return autorender(() => {
        return <>{services?.map((s, i) => <React.Fragment key={i}>{s.render()}</React.Fragment>)}</>
    }, [currentService])
}

