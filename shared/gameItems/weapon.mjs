import GameItem from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Weapon extends GameItem {
  constructor({
    id,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.WEAPON,
    isTwoHanded = false,
    skill = {},
    weapon = {},
  }) {
    super({ id, displayName, imgURL, type });

    this.isTwoHanded = isTwoHanded;
    this.skill = skill;
    this.weapon = weapon;
  }
}
