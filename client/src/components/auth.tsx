import React, { useContext } from "react"
import * as services from "../services"

const AuthContext = React.createContext<services.Auth | null>(null)

interface AuthProps {
  auth: services.Auth
  children: React.ReactNode
}

export function Auth({ children, auth }: AuthProps): JSX.Element {
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth(): services.Auth {
  const auth = useContext(AuthContext)
  if (!auth)
    throw new Error("Auth service is not provided")
  return auth
}
