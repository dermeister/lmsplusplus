import { autorender } from "../autorender"
import { IScreen } from "../IScreen"

interface AppProps {
    currentScreen: IScreen
}

export function App({ currentScreen }: AppProps): JSX.Element {
    return autorender(() => currentScreen.render(), [currentScreen])
}
