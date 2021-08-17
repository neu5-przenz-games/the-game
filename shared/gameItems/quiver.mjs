import GameItem from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Quiver extends GameItem {
  constructor({ name, displayName, imgURL = "", type = ITEM_TYPES.QUIVER }) {
    super({ name, displayName, imgURL, type });
  }
}
