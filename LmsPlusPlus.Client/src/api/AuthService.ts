import { Axios, AxiosError } from "axios"
import { reaction, Transaction, transaction } from "reactronic"
import { AppError } from "../AppError"
import { ObservableObject } from "../ObservableObject"
import * as response from "./response"

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
            Transaction.off(() => this.signOut())
        try {
            const result = await this._api.post<{ token: string }>("sign-in", { login, password })
            this._jwtToken = result.data.token
        } catch (e) {
            if (e instanceof AxiosError && e.response?.status === 400) {
                const problemDetails = e.response.data as response.ProblemDetails
                throw new AppError(problemDetails.title, problemDetails.detail)
            }
            throw e
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
