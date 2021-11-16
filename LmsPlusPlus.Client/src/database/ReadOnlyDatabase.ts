import { Monitor } from "reactronic"
import * as domain from "../domain"

export interface ReadOnlyDatabase {
  get monitor(): Monitor

  get courses(): readonly domain.Course[];

  get vcsConfiguration(): domain.VcsConfiguration;

  get preferences(): domain.Preferences;

  get user(): domain.User;

  get permissions(): domain.Permissions;
}
