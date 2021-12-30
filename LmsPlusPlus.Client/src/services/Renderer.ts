import { Disposable } from "../Disposable"

export interface Renderer extends Disposable {
    show(element: HTMLElement): void;

    hide(): void;
}
