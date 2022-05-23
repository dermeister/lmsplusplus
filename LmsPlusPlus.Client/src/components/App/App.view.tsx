import { autorender } from "../autorender";
import { AppModel } from "./App.model";

interface AppViewProps {
    model: AppModel
}

export function AppView({ model }: AppViewProps) {
    return autorender(() => model.currentScreen.render())
}
