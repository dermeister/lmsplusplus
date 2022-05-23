import { reaction, standalone, transaction } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export interface IAuthService {
    signIn(login: string, password: string): Promise<boolean>

    signOut(): void
}

export class AuthService extends ObservableObject implements IAuthService {
    private _jwtToken: string | null = null
    private readonly _localStorageKey: string

    get jwtToken(): string | null { return this._jwtToken }

    constructor(localStorageKey: string) {
        super()
        this._localStorageKey = localStorageKey
        this._jwtToken = this.loadJwtTokenFromLocalStorage()
    }

    @transaction
    async signIn(login: string, password: string): Promise<boolean> {
        if (this._jwtToken)
            standalone(() => this.signOut())
        try {
            this._jwtToken = await Promise.resolve("token")
        } catch (e) {
            if ((e as Error).message === "Bad Request")
                return false
            throw e
        }
        return true
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
            localStorage.setItem(this._localStorageKey, JSON.stringify(this._jwtToken))
    }

    private loadJwtTokenFromLocalStorage(): string | null {
        const token = localStorage.getItem(this._localStorageKey)
        return token ?? null
    }
}
