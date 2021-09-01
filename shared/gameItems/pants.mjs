import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

const pantsURL = "pants";

export class Pants extends GameItem {
  constructor({
    id,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.PANTS,
    details = {},
  }) {
    super({ id, displayName, imgURL: `${pantsURL}/${imgURL}`, type });

    this.details = details;
  }
}
