import React from "react"
import { autorender } from "../autorender"
import * as models from "../../models"
import { ServicesExplorer } from "./ServicesExplorer"
import { Button } from "../Button"
import styles from "./SolutionRunner.module.scss"
import { ConsoleServiceView } from "./ConsoleServiceView"
import { WebServiceView } from "./WebServiceView"

interface SolutionRunnerProps {
    model: models.TasksView
}

export function SolutionRunnerSidePanelContent({ model }: SolutionRunnerProps): JSX.Element {
    return autorender(() => {
        const solutionRunner = getSolutionRunner(model)
        let body: JSX.Element = <></>
        if (solutionRunner.isLoadingApplication)
            body = <p className={styles.loadingPlaceholder}>Wait for application to load</p>
        else if (solutionRunner.servicesExplorer)
            body = <ServicesExplorer model={solutionRunner.servicesExplorer} />
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
        const serviceView = getSolutionRunner(model).serviceView
        if (serviceView instanceof models.ConsoleServiceView)
            return <ConsoleServiceView model={serviceView} />
        else if (serviceView instanceof models.WebServiceView)
            return <WebServiceView model={serviceView} />
        else
            return <></>
    }, [model])
}

function getSolutionRunner(model: models.TasksView): models.SolutionRunner {
    if (!model.solutionRunner)
        throw new Error("Solution runner is not created")
    return model.solutionRunner
}
