import { reaction, transaction } from "reactronic"
import { VscConfiguration } from "../domain/VscConfiguration"
import { ObservableObject } from "../ObservableObject"

export class VscConfigurationRepository extends ObservableObject {
  private _configuration = VscConfiguration.default

  get configuration(): VscConfiguration { return this._configuration }

  @transaction
  async update(configuration: VscConfiguration): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))

    this._configuration = configuration
  }

  @reaction
  private async vsc_configuration_fetched_from_api(): Promise<void> {
    this._configuration = new VscConfiguration()
  }
}
