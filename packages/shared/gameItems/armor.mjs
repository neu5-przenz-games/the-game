import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

const armorURL = "armor";

export class Armor extends GameItem {
  constructor({
    id,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.ARMOR,
    details = {},
  }) {
    super({ id, displayName, imgURL: `${armorURL}/${imgURL}`, type });

    this.details = details;
  }
}
