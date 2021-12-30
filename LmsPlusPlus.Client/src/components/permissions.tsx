import React, { useContext } from "react"
import * as domain from "../domain"

const PermissionsContext = React.createContext<domain.Permissions | null>(null)

interface PermissionsProps {
    permissions: domain.Permissions
    children: React.ReactNode
}

export function Permissions({ children, permissions }: PermissionsProps): JSX.Element {
    return <PermissionsContext.Provider value={permissions}>{children}</PermissionsContext.Provider>
}

export function usePermissions(): domain.Permissions {
    const permissions = useContext(PermissionsContext)
    if (!permissions)
        throw new Error("Permissions are not provided")
    return permissions
}
