export class Api {
    async get<T>(url: string): Promise<T> {
        const response = await fetch(url)
        return await response.json()
    }

    async post<T>(url: string, body: object): Promise<T> {
        const response = await fetch(url, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        return await response.json()
    }

    async put<T>(url: string, body: object): Promise<T> {
        const response = await fetch(url, {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        return await response.json()
    }

    async delete(url: string): Promise<void> {
        await fetch(url, { method: "delete" })
    }
}
