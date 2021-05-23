import React from "react";

import autorender from "../autorender";
import { SignIn } from "../SignIn";
import { AppModel } from "./AppModel";

interface AppProps {
  model: AppModel;
}

function content(model: AppModel): JSX.Element {
  if (model.auth.user === null) return <SignIn model={model.signIn} />;
  return signedIn();
}

function signedIn(): JSX.Element {
  return <div>Sign out</div>;
}

export function App({ model }: AppProps): JSX.Element {
  async function onClick(): Promise<void> {
    if (model.auth.user === null) {
      await model.auth.signIn("Denis", "12345678");
    } else {
      model.auth.signOut();
    }
  }

  return autorender(() => (
    <div>
      <button onClick={onClick}>Click</button>
      {content(model)}
    </div>
  ));
}
