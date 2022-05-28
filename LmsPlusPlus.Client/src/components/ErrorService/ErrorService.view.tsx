import React from "react"
import { autorender } from "../autorender"
import * as model from "./ErrorService.model"
import styles from "./ErrorService.module.scss"

interface ErrorServiceProps {
    errorService: model.ErrorService
}

export function ErrorService({ errorService }: ErrorServiceProps): JSX.Element {
    function renderError(error: Error): JSX.Element {
        return (
            <div className={styles.error}>
                <span className={styles.errorMessage}>{error.message}</span>
                <button className={styles.errorCloseButton} onClick={() => errorService.closeError(error)} />
            </div>
        )
    }

    return autorender(() => (
        <ul className={styles.container}>
            {errorService.errors.map((e, i) => <li key={i}>{renderError(e)}</li>)}
        </ul>
    ), [errorService])
}
