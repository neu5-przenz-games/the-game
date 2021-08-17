import GameItem from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Boots extends GameItem {
  constructor({ name, displayName, imgURL = "", type = ITEM_TYPES.BOOTS }) {
    super({ name, displayName, imgURL, type });
  }
}
