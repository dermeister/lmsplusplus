import React from "react"
import { autorender } from "../autorender"
import { IRenderer } from "./IRenderer"

interface ServiceViewProps {
    renderers: IRenderer[]
    currentRenderer: IRenderer
}

export function ServiceView({ renderers }: ServiceViewProps): JSX.Element {
    return autorender(() => {
        return <>{renderers.map((r, i) => <React.Fragment key={i}>{r.render()}</React.Fragment>)}</>
    }, [renderers])
}
