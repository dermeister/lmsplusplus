export interface IServiceWorkerService {
    startServiceWorker(): Promise<ServiceWorker | null>
}
