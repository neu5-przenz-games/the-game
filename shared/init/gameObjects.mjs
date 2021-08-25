import { FRACTIONS } from "../fractions/index.mjs";
import { CopperOre, HealingStone, House, Tree } from "../gameObjects/index.mjs";

const direHouse = FRACTIONS[1].houses[0];
const radiantHouse = FRACTIONS[0].houses[0];

export const gameObjects = [
  new House({
    name: direHouse.name,
    displayName: direHouse.displayName,
    positionTile: { tileX: 14, tileY: 8 },
  }),
  new House({
    name: radiantHouse.name,
    displayName: radiantHouse.displayName,
    positionTile: { tileX: 15, tileY: 30 },
  }),
  new Tree({
    name: "tree1",
    displayName: "tree",
    positionTile: { tileX: 17, tileY: 4 },
  }),
  new Tree({
    name: "tree2",
    displayName: "tree",
    positionTile: { tileX: 20, tileY: 20 },
  }),
  new CopperOre({
    name: "ore-copper-1",
    displayName: "copper ore",
    positionTile: { tileX: 20, tileY: 12 },
  }),
  new CopperOre({
    name: "ore-copper-2",
    displayName: "copper ore",
    positionTile: { tileX: 16, tileY: 23 },
  }),
  new HealingStone({
    name: "healing-stone",
    displayName: "healing stone",
    positionTile: { tileX: 10, tileY: 20 },
  }),
];
