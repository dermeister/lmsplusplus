import React from "react"
import { autorender } from "../autorender"
import { Message } from "./Message"
import * as model from "./MessageService.model"
import styles from "./MessageService.module.scss"

interface MessagesProps {
    messageService: model.MessageService
}

export function Messages({ messageService }: MessagesProps): JSX.Element {
    function renderMessage(message: Message): JSX.Element {
        return (
            <div className={styles.message}>
                <h2 className={styles.title}>{message.title}</h2>
                <p className={styles.details}>{message.details}</p>
                <button className={styles.messageCloseButton} onClick={() => messageService.closeMessage(message)} />
            </div>
        )
    }

    return autorender(() => (
        <ul className={styles.messages}>
            {messageService.messages.map((m, i) => <li key={i}>{renderMessage(m)}</li>)}
        </ul>
    ), [messageService])
}
