import { Pants } from "../../gameItems/index.mjs";

export const leatherPants = new Pants({
  id: "pants",
  displayName: "Pants",
  imgURL: "pants.png",
  details: {
    defense: 50,
  },
});

export const frozenPants = new Pants({
  id: "frozenPants",
  displayName: "Frozen pants",
  imgURL: "frozen_pants.png",
  details: {
    defense: 250,
  },
});

export const pants = [leatherPants, frozenPants];
