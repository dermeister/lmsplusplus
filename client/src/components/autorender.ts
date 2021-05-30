import { useEffect, useState } from "react";
import {
  cached,
  ObservableObject,
  reaction,
  Reactronic,
  standalone,
  Transaction,
  unobservable,
} from "reactronic";

export default function autorender(jsx: () => JSX.Element): JSX.Element {
  const [state, refresh] = useState(createReactState);
  const { rx } = state;

  rx.refresh = refresh;
  useEffect(() => rx.unmount, []);

  return rx.render(jsx);
}

type ReactState = { rx: Rx };

class Rx extends ObservableObject {
  @unobservable
  public refresh: ((rx: ReactState) => void) | null = null;
  @unobservable
  public unmount = () => standalone(() => Transaction.run(Reactronic.dispose, this));

  @cached
  public render(jsx: () => JSX.Element): JSX.Element {
    return jsx();
  }

  @reaction
  private ensureUpToDate(): void {
    if (!Reactronic.getController(this.render).isUpToDate) {
      standalone(() => this.refresh?.({ rx: this }));
    }
  }
}

function createReactState(): ReactState {
  return { rx: Transaction.run(() => new Rx()) };
}
