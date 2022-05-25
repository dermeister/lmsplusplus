import { Disposable } from "../Disposable"

export interface IScreen extends Disposable {
    render(): JSX.Element
}
