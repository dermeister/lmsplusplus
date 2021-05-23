import React from "react";

import autorender from "../autorender";
import { SignInModel } from "./SignInModel";

interface SignInProps {
  model: SignInModel;
}

export function SignIn({ model }: SignInProps): JSX.Element {
  return autorender(() => <div>Sign in!</div>);
}
