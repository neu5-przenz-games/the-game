import { Boots } from "../../gameItems/index.mjs";

export const leatherBoots = new Boots({
  id: "boots",
  displayName: "Boots",
  imgURL: "boots.png",
  details: {
    defence: 20,
  },
});

export const frozenBoots = new Boots({
  id: "frozenBoots",
  displayName: "Frozen boots",
  imgURL: "frozen_boots.png",
  details: {
    defence: 100,
  },
});

export const boots = [leatherBoots, frozenBoots];
