import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export class Helmet extends GameItem {
  constructor({ id, displayName, imgURL = "", type = ITEM_TYPES.HELMET }) {
    super({ id, displayName, imgURL, type });
  }
}
