import { Pants } from "../../gameItems/index.mjs";

export const leatherPants = new Pants({
  id: "pants",
  displayName: "Pants",
  imgURL: "pants.png",
  details: {
    defence: 50,
  },
});

export const frozenPants = new Pants({
  id: "frozenPants",
  displayName: "Frozen pants",
  imgURL: "frozen_pants.png",
  details: {
    defence: 300,
  },
});

export const pants = [leatherPants, frozenPants];
