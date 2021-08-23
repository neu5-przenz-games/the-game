import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export class Shield extends GameItem {
  constructor({
    id,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.SHIELD,
    skillToIncrease = {},
    details = {},
  }) {
    super({ id, displayName, imgURL, type });

    this.skillToIncrease = skillToIncrease;
    this.details = details;
  }
}
