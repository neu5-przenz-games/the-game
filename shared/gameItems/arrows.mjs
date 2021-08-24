import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

const arrowsURL = "arrows";

export class Arrows extends GameItem {
  constructor({ id, displayName, imgURL = "", type = ITEM_TYPES.ARROWS }) {
    super({ id, displayName, imgURL: `${arrowsURL}/${imgURL}`, type });
  }
}
