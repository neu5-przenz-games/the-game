import { Backpack } from "../../gameItems/index.mjs";

export const backpack = new Backpack({
  id: "backpack",
  displayName: "Backpack",
  imgURL: "backpack_6.png",
  slots: 6,
});

export const bag = new Backpack({
  id: "bag",
  displayName: "Bag",
  imgURL: "bag.png",
  slots: 4,
});

export const backpacks = [backpack, bag];
