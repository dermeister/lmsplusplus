import { Axios, AxiosError } from "axios"
import { reaction, standalone, transaction } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export class AuthError extends Error {
    readonly axiosError: AxiosError

    constructor(axiosError: AxiosError) {
        super()
        this.axiosError = axiosError
    }
}

export interface IAuthService {
    signIn(login: string, password: string): Promise<void>

    signOut(): void
}

export class AuthService extends ObservableObject implements IAuthService {
    private readonly _localStorageKey: string
    private readonly _api: Axios
    private _jwtToken: string | null = null

    get jwtToken(): string | null { return this._jwtToken }

    constructor(api: Axios, localStorageKey: string) {
        super()
        this._localStorageKey = localStorageKey
        this._api = api
        this._jwtToken = this.loadJwtTokenFromLocalStorage()
    }

    @transaction
    async signIn(login: string, password: string): Promise<void> {
        if (this._jwtToken)
            standalone(() => this.signOut())
        try {
            const result = await this._api.post<{ token: string }>("/api/sign-in", { login, password })
            this._jwtToken = result.data.token
        } catch (e) {
            throw e instanceof AxiosError ? new AuthError(e) : e
        }
    }

    @transaction
    signOut(): void {
        this._jwtToken = null
    }

    @reaction
    private updateLocalStorage(): void {
        if (!this._jwtToken)
            localStorage.removeItem(this._localStorageKey)
        else if (!localStorage.getItem(this._localStorageKey))
            localStorage.setItem(this._localStorageKey, this._jwtToken)
    }

    private loadJwtTokenFromLocalStorage(): string | null {
        const token = localStorage.getItem(this._localStorageKey)
        return token ?? null
    }
}
