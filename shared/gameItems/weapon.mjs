import GameItem from "./gameItem.mjs";
import { ITEM_TYPES } from "./itemTypes.mjs";

export default class Weapon extends GameItem {
  constructor({
    name,
    displayName,
    imgURL = "",
    type = ITEM_TYPES.WEAPON,
    isTwoHanded = false,
    skill = {},
    weapon = {},
  }) {
    super({ name, displayName, imgURL, type });

    this.isTwoHanded = isTwoHanded;
    this.skill = skill;
    this.weapon = weapon;
  }
}
