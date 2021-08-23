import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export class Weapon extends GameItem {
  constructor({
    id,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.WEAPON,
    isTwoHanded = false,
    skillToIncrease = {},
    details = {},
  }) {
    super({ id, displayName, imgURL, type });

    this.isTwoHanded = isTwoHanded;
    this.skillToIncrease = skillToIncrease;
    this.details = details;
  }
}
