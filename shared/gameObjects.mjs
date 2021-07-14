import FRACTIONS from "./fractions.mjs";

const REAL_PROPERTIES = {
  House: {
    action: "rest",
  },
  Tree: {
    action: "chop",
    durationTicks: 150,
    item: {
      id: "wood",
      quantity: 1,
    },
  },
  Ore: {
    action: "mine",
    durationTicks: 300,
    item: {
      id: "copper ore",
      quantity: 1,
    },
  },
};

const getAction = (obj) => REAL_PROPERTIES[obj.type].action;

const getDuration = (obj) => REAL_PROPERTIES[obj.type].durationTicks;

const getItem = (obj) => REAL_PROPERTIES[obj.type].item;

const getStartingTile = ({ tileX, tileY }) => ({ tileX, tileY });

const getStartingTileHouse = ({ tileX, tileY }) => ({
  tileX: tileX - 2,
  tileY,
});

const getStartingTileTree = getStartingTile;

const direHouse = FRACTIONS[1].houses[0];
const radiantHouse = FRACTIONS[0].houses[0];

const gameObjects = [
  {
    name: direHouse.name,
    displayName: direHouse.displayName,
    type: "House",
    positionTile: { tileX: 14, tileY: 8 },
    startingTile: getStartingTileHouse,
    size: { tileX: 4, tileY: 3 },
  },
  {
    name: radiantHouse.name,
    displayName: radiantHouse.displayName,
    type: "House",
    positionTile: { tileX: 15, tileY: 30 },
    startingTile: getStartingTileHouse,
    size: { tileX: 4, tileY: 3 },
  },
  {
    name: "tree1",
    displayName: "tree",
    type: "Tree",
    positionTile: { tileX: 17, tileY: 4 },
    startingTile: getStartingTileTree,
    size: { tileX: 1, tileY: 1 },
  },
  {
    name: "tree2",
    displayName: "tree",
    type: "Tree",
    positionTile: { tileX: 20, tileY: 20 },
    startingTile: getStartingTileTree,
    size: { tileX: 1, tileY: 1 },
  },
  {
    name: "ore-copper-1",
    displayName: "copper ore",
    type: "Ore",
    positionTile: { tileX: 20, tileY: 12 },
    startingTile: getStartingTileTree,
    size: { tileX: 1, tileY: 1 },
  },
  {
    name: "ore-copper-2",
    displayName: "copper ore",
    type: "Ore",
    positionTile: { tileX: 16, tileY: 23 },
    startingTile: getStartingTileTree,
    size: { tileX: 1, tileY: 1 },
  },
].map((gameObject) => ({
  ...gameObject,
  startingTile: gameObject.startingTile(gameObject.positionTile),
}));

export { gameObjects, getAction, getDuration, getItem };
