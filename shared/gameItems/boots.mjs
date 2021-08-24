import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

const bootsURL = "boots";

export class Boots extends GameItem {
  constructor({ id, displayName, imgURL = "", type = ITEM_TYPES.BOOTS }) {
    super({ id, displayName, imgURL: `${bootsURL}/${imgURL}`, type });
  }
}
