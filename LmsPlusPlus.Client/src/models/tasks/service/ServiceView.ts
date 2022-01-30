export interface ServiceView {
    mount(element: HTMLElement): void

    unmount(): void
}
