import React, { useEffect, useRef } from "react"
import { autorender } from "../autorender"
import * as models from "../../models"
import { ServicesExplorer } from "./ServicesExplorer"
import { Button } from "../Button"
import styles from "./SolutionRunner.module.scss"

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
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (ref.current) {
            let solutionRunner = getSolutionRunner(model)
            solutionRunner.mountApplication(ref.current)
        }
        return () => model.solutionRunner?.unmountApplication()
    }, [model])

    return autorender(() => {
        const solutionRunner = getSolutionRunner(model)
        return <div ref={ref} />
    }, [model, ref])
}

function getSolutionRunner(model: models.TasksView): models.SolutionRunner {
    if (!model.solutionRunner)
        throw new Error("Solution runner is not created")
    return model.solutionRunner
}
