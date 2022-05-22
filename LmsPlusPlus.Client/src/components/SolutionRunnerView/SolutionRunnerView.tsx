import React from "react"
import { autorender } from "../autorender"
import * as models from "../../models"
import { ServicesExplorerView } from "../ServicesExplorer/ServicesExplorerView"
import { Button } from "../Button"
import styles from "./SolutionRunner.module.scss"
import { ConsoleServiceViewModel } from "./service/ConsoleServiceView"
import { WebServiceViewModel } from "./service/WebServiceView"
import { SolutionRunner } from "./SolutionRunner"
import { ITasksService } from "../ITasksService"
import { ConsoleServiceView } from "./ConsoleServiceView"
import { WebServiceView } from "./WebServiceView"

interface SolutionRunnerProps {
    model: SolutionRunner
    tasksService: ITasksService
}

export function SolutionRunnerSidePanelContent({ model, tasksService }: SolutionRunnerProps): JSX.Element {
    return autorender(() => {
        let body: JSX.Element = <></>
        if (model.isLoadingApplication)
            body = <p className={styles.loadingPlaceholder}>Wait for application to load</p>
        else if (model.servicesExplorer)
            body = <ServicesExplorerView model={model.servicesExplorer} />
        return (
            <div className={styles.sidePanelContent}>
                {body}
                <Button className={styles.stopButton} variant="danger" onClick={() => model.stopSolution()}>Stop</Button>
            </div>
        )
    }, [model])
}

export function SolutionRunnerMainPanelContent({ model }: SolutionRunnerProps): JSX.Element {
    return autorender(() => {
        if (model.serviceView instanceof ConsoleServiceViewModel)
            return <ConsoleServiceView model={model.serviceView} />
        else if (model.serviceView instanceof WebServiceViewModel)
            return <WebServiceView model={model.serviceView} />
        else
            return <></>
    }, [model])
}


