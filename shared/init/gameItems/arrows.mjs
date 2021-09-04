import { Arrows } from "../../gameItems/index.mjs";

export const arrowsBunch = new Arrows({
  id: "arrowsBunch",
  displayName: "Arrows",
  imgURL: "arrows.png",
  details: {
    damage: [10, 20],
  },
});

export const arrows = [arrowsBunch];
