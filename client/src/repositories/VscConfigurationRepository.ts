import { reaction, transaction } from "reactronic"
import { VscConfiguration } from "../domain/VscConfiguration"
import { ObservableObject } from "../ObservableObject"

export abstract class VscConfigurationRepository extends ObservableObject {
  protected _configuration = VscConfiguration.default

  get configuration(): VscConfiguration { return this._configuration }
}

export class VscConfigurationRepositoryInternal extends VscConfigurationRepository {
  @transaction
  async update(configuration: VscConfiguration): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))

    this._configuration = configuration
  }

  @reaction
  private async vsc_configuration_fetched_from_api(): Promise<void> {
    this._configuration = VscConfiguration.default
  }
}
