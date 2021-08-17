import GameItem from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Armor extends GameItem {
  constructor({ name, displayName, imgURL = "", type = ITEM_TYPES.ARMOR }) {
    super({ name, displayName, imgURL, type });
  }
}
