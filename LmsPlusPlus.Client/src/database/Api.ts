export class Api {
    private readonly _token: string | null

    constructor(token: string | null = null) {
        this._token = token
    }

    async get<T>(url: string): Promise<T> {
        const response = await fetch(url, {
            headers: this.createHeaders(null, this._token)
        })
        return await response.json()
    }

    async post<T>(url: string, body: object): Promise<T> {
        const response = await fetch(url, {
            method: "post",
            headers: this.createHeaders("application/json", this._token),
            body: JSON.stringify(body)
        })
        if (response.status === 400)
            throw new Error("Bad Request")
        return await response.json()
    }

    async put<T>(url: string, body: object): Promise<T> {
        const response = await fetch(url, {
            method: "put",
            headers: this.createHeaders("application/json", this._token),
            body: JSON.stringify(body)
        })
        return await response.json()
    }

    async delete(url: string): Promise<void> {
        await fetch(url, {
            method: "delete",
            headers: this.createHeaders(null, this._token)
        })
    }

    private createHeaders(contentType: string | null, authorizationToken: string | null): HeadersInit {
        const headers: Record<string, string> = {}
        if (contentType)
            headers["Content-Type"] = contentType
        if (authorizationToken)
            headers["Authorization"] = `Bearer ${authorizationToken}`
        return headers
    }
}
