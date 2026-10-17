/**
 * The "bought together" list of a product has three states (the server decides what the shop shows, see
 * `findRelated` in server/src/modules/products/products.repo.ts):
 *
 *   automatic - never set. The shop suggests products from related categories. The API omits `relatedProducts`.
 *   none      - the admin emptied the list on purpose (`[]`). The shop shows no bundle box.
 *   manual    - a curated list of product ids.
 *
 * The admin form edits a draft of this list; this module turns the draft into the value for the save request.
 */

export interface RelatedProductsDraft {
  /** Product ids currently in the picker. */
  ids: string[];
  /** True while the list is in the "automatic" state, i.e. the admin has not curated it (or went back to automatic). */
  auto: boolean;
  /** True once the admin added, removed or reset something in this form session. */
  touched: boolean;
}

/**
 * `relatedProducts` for the save request:
 *  - `undefined` leaves the stored value untouched: the admin did not touch the picker (the form can be stale, and
 *    re-sending the list it loaded would undo a change another session made), or it is still automatic;
 *  - `null` returns the product to automatic suggestions (only meaningful when it was manual or "none" before);
 *  - an array (including `[]`) stores that list. `[]` must be sent as `[]`: omitting it would silently keep the
 *    old list, which is why removing the last product used to have no effect.
 *
 * @param stored the product's current `relatedProducts` (undefined for a new product or one in automatic state)
 */
export function buildRelatedProductsPayload(
  draft: RelatedProductsDraft,
  stored: string[] | undefined,
): string[] | null | undefined {
  if (!draft.touched) return undefined;
  if (draft.auto) return stored === undefined ? undefined : null;
  return draft.ids;
}
