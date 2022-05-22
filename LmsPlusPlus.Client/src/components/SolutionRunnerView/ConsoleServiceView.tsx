import React, { useEffect, useRef } from "react"
import * as models from "../../models"
import { ConsoleServiceViewModel } from "./service/ConsoleServiceView"

interface ConsoleServiceViewProps {
    model: ConsoleServiceViewModel
}

export function ConsoleServiceView({ model }: ConsoleServiceViewProps): JSX.Element {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (ref.current)
            model.mount(ref.current)
        return () => model.unmount()
    }, [model])

    return <div ref={ref} />
}
