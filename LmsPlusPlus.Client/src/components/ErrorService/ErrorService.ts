export interface IErrorService {
    showError(error: Error): void
}

export class ErrorService implements IErrorService {
    showError(error: Error): void {
        console.log(`Error message: ${error.message}`)
    }
}
