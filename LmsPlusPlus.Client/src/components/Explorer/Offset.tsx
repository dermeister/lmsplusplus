import { createContext, useContext } from "react"
import styles from "./Offset.module.scss"

export const OffsetContext = createContext(Number(styles.offsetBase))

export function useOffset(): number {
    return useContext(OffsetContext)
}
