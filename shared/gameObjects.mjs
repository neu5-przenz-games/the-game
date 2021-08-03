import FRACTIONS from "./fractions.mjs";
import { SKILLS_TYPES } from "./skills.mjs";

const REAL_PROPERTIES = {
  HealingStone: {
    action: "heal",
  },
  House: {
    action: "rest",
  },
  Tree: {
    action: "chop",
    durationTicks: 150,
    skill: {
      name: SKILLS_TYPES.LUMBERJACKING,
      pointsToGain: 5,
    },
    item: {
      id: "wood",
      quantity: 1,
    },
  },
  Ore: {
    action: "mine",
    durationTicks: 30,
    skill: {
      name: SKILLS_TYPES.MINING,
      pointsToGain: 5,
    },
    item: {
      id: "copper ore",
      quantity: 1,
    },
  },
};

const getAction = (obj) => REAL_PROPERTIES[obj.type].action;

const getDuration = (obj) => REAL_PROPERTIES[obj.type].durationTicks;

const getItem = (obj) => REAL_PROPERTIES[obj.type].item;

const getSkillDetails = (obj) => REAL_PROPERTIES[obj.type].skill;

const getStartingTile = ({ tileX, tileY }) => ({ tileX, tileY });

const getStartingTileHouse = ({ tileX, tileY }) => ({
  tileX: tileX - 2,
  tileY,
});

const getStartingTileTree = getStartingTile;

const getStartingTileHealingStone = getStartingTile;

// @TODO: Clean up getSurroundingTiles function and test it #238
const getHealingArea = ({ tileX, tileY, size = 4 }) => {
  const tiles = [];

  for (let x = tileX - size; x <= tileX + size + 1; x += 1) {
    for (let y = tileY - size; y <= tileY + size + 1; y += 1) {
      tiles.push({ tileX: x, tileY: y });
    }
  }

  return tiles;
};

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
  {
    name: "healing-stone",
    displayName: "healing stone",
    type: "HealingStone",
    positionTile: { tileX: 10, tileY: 20 },
    startingTile: getStartingTileHealingStone,
    healingArea: getHealingArea,
    size: { tileX: 2, tileY: 2 },
    healingDelayTicks: 10,
    healingDelayMaxTicks: 10,
    HP_REGEN_RATE: 2,
    isPlayerInHealingArea(positionTile) {
      return this.healingArea.some(
        ({ tileX, tileY }) =>
          tileX === positionTile.tileX && tileY === positionTile.tileY
      );
    },
  },
].map((gameObject) => ({
  ...gameObject,
  startingTile: gameObject.startingTile(gameObject.positionTile),
  ...(gameObject.healingArea && {
    healingArea: gameObject.healingArea(gameObject.positionTile),
  }),
}));

export { gameObjects, getAction, getDuration, getItem, getSkillDetails };
