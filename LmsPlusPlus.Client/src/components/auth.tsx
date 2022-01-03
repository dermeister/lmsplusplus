import React, { useContext } from "react"
import * as models from "../models"

const AuthContext = React.createContext<models.Auth | null>(null)

interface AuthProps {
    auth: models.Auth
    children: React.ReactNode
}

export function Auth({ children, auth }: AuthProps): JSX.Element {
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth(): models.Auth {
    const auth = useContext(AuthContext)
    if (!auth)
        throw new Error("Auth service is not provided")
    return auth
}
