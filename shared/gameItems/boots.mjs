import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export class Boots extends GameItem {
  constructor({ id, displayName, imgURL = "", type = ITEM_TYPES.BOOTS }) {
    super({ id, displayName, imgURL, type });
  }
}
