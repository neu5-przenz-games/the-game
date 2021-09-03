import { Armor } from "../../gameItems/index.mjs";

export const armor = new Armor({
  id: "armor",
  displayName: "Armor",
  imgURL: "armor.png",
  details: {
    defence: 100,
  },
});

export const frozenArmor = new Armor({
  id: "frozenArmor",
  displayName: "Frozen armor",
  imgURL: "frozen_armor.png",
  details: {
    defence: 300,
  },
});

export const armors = [armor, frozenArmor];
