import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export class Armor extends GameItem {
  constructor({ id, displayName, imgURL = "", type = ITEM_TYPES.ARMOR }) {
    super({ id, displayName, imgURL, type });
  }
}
