import { reaction, transaction } from "reactronic"
import { VcsConfiguration } from "../domain/VcsConfiguration"
import { ObservableObject } from "../ObservableObject"

export abstract class VscConfigurationRepository extends ObservableObject {
  protected _configuration = VcsConfiguration.default

  get configuration(): VcsConfiguration { return this._configuration }
}

export class VscConfigurationRepositoryInternal extends VscConfigurationRepository {
  @transaction
  async update(configuration: VcsConfiguration): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))

    this._configuration = configuration
  }

  @reaction
  private async vsc_configuration_fetched_from_api(): Promise<void> {
    this._configuration = VcsConfiguration.default
  }
}
