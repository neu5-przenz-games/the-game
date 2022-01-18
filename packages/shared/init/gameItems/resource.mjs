import { Resource } from "../../gameItems/index.mjs";

export const copperOre = new Resource({
  id: "copper ore",
  displayName: "Copper ore",
  imgURL: "copper-ore.png",
});

export const wood = new Resource({
  id: "wood",
  displayName: "Wood",
  imgURL: "wood.png",
});

export const resources = [copperOre, wood];
