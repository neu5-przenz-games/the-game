import { GameItem } from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Shield extends GameItem {
  constructor({
    id,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.SHIELD,
    skillToIncrease = {},
    weapon = {},
  }) {
    super({ id, displayName, imgURL, type });

    this.skillToIncrease = skillToIncrease;
    this.weapon = weapon;
  }
}
