import GameItem from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Backpack extends GameItem {
  constructor({
    name,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.BACKPACK,
    slots,
  }) {
    super({ name, displayName, imgURL, type });

    this.slots = slots;
  }
}
