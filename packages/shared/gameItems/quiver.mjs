import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

const quiverURL = "quiver";

export class Quiver extends GameItem {
  constructor({ id, displayName, imgURL = "", type = ITEM_TYPES.QUIVER }) {
    super({ id, displayName, imgURL: `${quiverURL}/${imgURL}`, type });
  }
}
