import GameItem from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Pants extends GameItem {
  constructor({ name, displayName, imgURL = "", type = ITEM_TYPES.PANTS }) {
    super({ name, displayName, imgURL, type });
  }
}
