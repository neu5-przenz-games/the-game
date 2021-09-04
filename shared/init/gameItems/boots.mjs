import { Boots } from "../../gameItems/index.mjs";

export const leatherBoots = new Boots({
  id: "boots",
  displayName: "Boots",
  imgURL: "boots.png",
  details: {
    defense: 20,
  },
});

export const frozenBoots = new Boots({
  id: "frozenBoots",
  displayName: "Frozen boots",
  imgURL: "frozen_boots.png",
  details: {
    defense: 50,
  },
});

export const boots = [leatherBoots, frozenBoots];
