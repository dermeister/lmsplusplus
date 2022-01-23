export interface Renderer {
    mount(element: HTMLElement): void;

    unmount(): void;
}
