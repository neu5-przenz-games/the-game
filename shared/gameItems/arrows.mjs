import GameItem from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Arrows extends GameItem {
  constructor({ name, displayName, imgURL = "", type = ITEM_TYPES.ARROWS }) {
    super({ name, displayName, imgURL, type });
  }
}
