export interface IRenderer {
    get title(): string

    render(): JSX.Element
}
