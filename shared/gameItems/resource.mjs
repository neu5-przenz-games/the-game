import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Resource extends GameItem {
  constructor({ id, displayName, imgURL = "", type = ITEM_TYPES.RESOURCE }) {
    super({ id, displayName, imgURL, type });
  }
}
