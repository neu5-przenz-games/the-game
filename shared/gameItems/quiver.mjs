import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export class Quiver extends GameItem {
  constructor({ id, displayName, imgURL = "", type = ITEM_TYPES.QUIVER }) {
    super({ id, displayName, imgURL, type });
  }
}
