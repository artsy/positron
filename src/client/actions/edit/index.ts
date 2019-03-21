import { actions as articleActions } from "./articleActions"
import { actions as editActions } from "./editActions"
import { actions as errorActions } from "./errorActions"
import { actions as sectionActions } from "./sectionActions"

/**
 * Actions related to editing an individual article
 */
export const actions = {
  ...articleActions,
  ...editActions,
  ...errorActions,
  ...sectionActions,
}
