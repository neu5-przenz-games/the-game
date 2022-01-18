import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

const helmetURL = "helmet";

export class Helmet extends GameItem {
  constructor({
    id,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.HELMET,
    details = {},
  }) {
    super({ id, displayName, imgURL: `${helmetURL}/${imgURL}`, type });

    this.details = details;
  }
}
