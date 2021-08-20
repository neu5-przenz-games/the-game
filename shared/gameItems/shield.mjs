import GameItem from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Shield extends GameItem {
  constructor({
    id,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.SHIELD,
    skill = {},
    weapon = {},
  }) {
    super({ id, displayName, imgURL, type });

    this.skill = skill;
    this.weapon = weapon;
  }
}
