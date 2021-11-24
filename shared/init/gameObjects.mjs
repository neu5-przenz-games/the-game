import { FRACTIONS } from "../fractions/index.mjs";
import { CopperOre, HealingStone, House, Tree } from "../gameObjects/index.mjs";

const direHouse = FRACTIONS[1].houses[0];
const radiantHouse = FRACTIONS[0].houses[0];

export const gameObjects = [
  new House({
    name: direHouse.name,
    displayName: direHouse.displayName,
    positionTile: { tileX: 60, tileY: 50 },
  }),
  new House({
    name: radiantHouse.name,
    displayName: radiantHouse.displayName,
    positionTile: { tileX: 53, tileY: 60 },
  }),
];
