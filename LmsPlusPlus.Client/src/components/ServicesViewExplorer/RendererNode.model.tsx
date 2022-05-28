import { Node } from "../Explorer"
import { IRenderer } from "../SolutionRunnerView"

export class RendererNode extends Node<IRenderer> {
    private static _nextId = 1;
    constructor(renderer: IRenderer) {
        super((RendererNode._nextId++).toString(), renderer, renderer.title, null, null)
    }
}
