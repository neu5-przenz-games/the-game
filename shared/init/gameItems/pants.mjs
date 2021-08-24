import { Pants } from "../../gameItems/index.mjs";

export const leatherPants = new Pants({
  id: "pants",
  displayName: "Pants",
  imgURL: "pants.png",
});

export const frozenPants = new Pants({
  id: "frozenPants",
  displayName: "Frozen pants",
  imgURL: "frozen_pants.png",
});

export const pants = [leatherPants, frozenPants];
