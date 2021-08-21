import { Backpack } from "../../gameItems/index.mjs";

const bag = new Backpack({
  id: "bag",
  displayName: "Bag",
  imgURL: "bag.png",
  slots: 4,
});

const backpack = new Backpack({
  id: "backpack",
  displayName: "Backpack",
  imgURL: "backpack_6.png",
  slots: 6,
});

export const backpacks = [bag, backpack];
