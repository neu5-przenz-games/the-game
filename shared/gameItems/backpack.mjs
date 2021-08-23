import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export class Backpack extends GameItem {
  constructor({
    id,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.BACKPACK,
    slots,
  }) {
    super({ id, displayName, imgURL, type });

    this.slots = slots;
  }
}
