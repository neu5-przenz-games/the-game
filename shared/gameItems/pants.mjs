import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export class Pants extends GameItem {
  constructor({ id, displayName, imgURL = "", type = ITEM_TYPES.PANTS }) {
    super({ id, displayName, imgURL, type });
  }
}
