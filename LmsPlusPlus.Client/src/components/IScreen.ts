import { IDisposable } from "../IDisposable"

export interface IScreen extends IDisposable {
    render(): JSX.Element
}
